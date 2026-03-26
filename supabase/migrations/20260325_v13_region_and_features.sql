-- v1.3: Add region, persona, and receipt photo support
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS persona TEXT,
  ADD COLUMN IF NOT EXISTS receipt_photos_enabled BOOLEAN DEFAULT false;
