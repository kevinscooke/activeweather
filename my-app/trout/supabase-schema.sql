-- Estimating Apex Database Schema
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql/new

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Checklists table
CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client TEXT,
  location_number TEXT,
  start_time TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL, -- e.g., "ce-1"
  question TEXT NOT NULL,
  answer TEXT CHECK (answer IN ('yes', 'no', 'sub', 'super', 'apex') OR answer IS NULL),
  section TEXT NOT NULL CHECK (section IN ('ce', 'sow', 'pa')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(checklist_id, item_id) -- Prevent duplicate items per checklist
);

-- Notes/Log entries table
CREATE TABLE IF NOT EXISTS log_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  item_id TEXT,
  item_question TEXT,
  timestamp TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_checklists_user_id ON checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_checklists_created_at ON checklists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_checklist_id ON log_entries(checklist_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_created_at ON log_entries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view own checklists" ON checklists;
DROP POLICY IF EXISTS "Users can insert own checklists" ON checklists;
DROP POLICY IF EXISTS "Users can update own checklists" ON checklists;
DROP POLICY IF EXISTS "Users can delete own checklists" ON checklists;

DROP POLICY IF EXISTS "Users can view own checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Users can insert own checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Users can update own checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Users can delete own checklist items" ON checklist_items;

DROP POLICY IF EXISTS "Users can view own log entries" ON log_entries;
DROP POLICY IF EXISTS "Users can insert own log entries" ON log_entries;
DROP POLICY IF EXISTS "Users can update own log entries" ON log_entries;
DROP POLICY IF EXISTS "Users can delete own log entries" ON log_entries;

-- Row Level Security Policies for checklists
CREATE POLICY "Users can view own checklists"
  ON checklists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklists"
  ON checklists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists"
  ON checklists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklists"
  ON checklists FOR DELETE
  USING (auth.uid() = user_id);

-- Row Level Security Policies for checklist_items
CREATE POLICY "Users can view own checklist items"
  ON checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = checklist_items.checklist_id
      AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own checklist items"
  ON checklist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = checklist_items.checklist_id
      AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own checklist items"
  ON checklist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = checklist_items.checklist_id
      AND checklists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = checklist_items.checklist_id
      AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own checklist items"
  ON checklist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = checklist_items.checklist_id
      AND checklists.user_id = auth.uid()
    )
  );

-- Row Level Security Policies for log_entries
CREATE POLICY "Users can view own log entries"
  ON log_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = log_entries.checklist_id
      AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own log entries"
  ON log_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = log_entries.checklist_id
      AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own log entries"
  ON log_entries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = log_entries.checklist_id
      AND checklists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = log_entries.checklist_id
      AND checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own log entries"
  ON log_entries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = log_entries.checklist_id
      AND checklists.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at
  BEFORE UPDATE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

