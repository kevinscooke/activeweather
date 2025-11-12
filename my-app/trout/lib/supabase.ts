import { createClient } from '@supabase/supabase-js';
import { ChecklistData } from '@/types';

// These will be set via environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (will be generated from Supabase later)
export interface Database {
  public: {
    Tables: {
      checklists: {
        Row: {
          id: string;
          user_id: string;
          client: string | null;
          location_number: string | null;
          start_time: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client?: string | null;
          location_number?: string | null;
          start_time?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client?: string | null;
          location_number?: string | null;
          start_time?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      checklist_items: {
        Row: {
          id: string;
          checklist_id: string;
          item_id: string;
          question: string;
          answer: string | null;
          section: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          checklist_id: string;
          item_id: string;
          question: string;
          answer?: string | null;
          section: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          checklist_id?: string;
          item_id?: string;
          question?: string;
          answer?: string | null;
          section?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      log_entries: {
        Row: {
          id: string;
          checklist_id: string;
          message: string;
          item_id: string | null;
          item_question: string | null;
          timestamp: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          checklist_id: string;
          message: string;
          item_id?: string | null;
          item_question?: string | null;
          timestamp: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          checklist_id?: string;
          message?: string;
          item_id?: string | null;
          item_question?: string | null;
          timestamp?: string;
          date?: string;
          created_at?: string;
        };
      };
    };
  };
}

