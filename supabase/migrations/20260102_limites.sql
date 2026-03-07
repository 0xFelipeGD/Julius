-- Replace meta_diaria/meta_mensal with a flexible per-tag limits JSONB column
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS limites jsonb,
  DROP COLUMN IF EXISTS meta_diaria,
  DROP COLUMN IF EXISTS meta_mensal;
