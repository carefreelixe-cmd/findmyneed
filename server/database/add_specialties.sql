-- Add specialties column to providers table if it doesn't exist
ALTER TABLE providers ADD COLUMN IF NOT EXISTS specialties TEXT[];
