-- Add budget goal columns to user_settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS meta_diaria numeric,
  ADD COLUMN IF NOT EXISTS meta_mensal numeric;
