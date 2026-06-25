-- Store a small user-uploaded account avatar without requiring Supabase Storage.

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS avatar_data_url text,
  ADD COLUMN IF NOT EXISTS chat_background_data_url text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_settings_avatar_data_url_size'
      AND conrelid = 'public.user_settings'::regclass
  ) THEN
    ALTER TABLE public.user_settings
      ADD CONSTRAINT user_settings_avatar_data_url_size
      CHECK (avatar_data_url IS NULL OR char_length(avatar_data_url) <= 300000);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_settings_chat_background_data_url_size'
      AND conrelid = 'public.user_settings'::regclass
  ) THEN
    ALTER TABLE public.user_settings
      ADD CONSTRAINT user_settings_chat_background_data_url_size
      CHECK (chat_background_data_url IS NULL OR char_length(chat_background_data_url) <= 900000);
  END IF;
END;
$$;
