-- Update existing schema to allow 'sub', 'super', and 'apex' answers
-- Run this if you already ran the original schema.sql

ALTER TABLE checklist_items DROP CONSTRAINT IF EXISTS checklist_items_answer_check;

ALTER TABLE checklist_items 
  ADD CONSTRAINT checklist_items_answer_check 
  CHECK (answer IN ('yes', 'no', 'sub', 'super', 'apex') OR answer IS NULL);

