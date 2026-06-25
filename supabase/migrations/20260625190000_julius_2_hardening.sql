-- Julius 2.0 hardening after local migration preflight.

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Europe/Lisbon';

UPDATE public.user_settings
SET timezone = 'Europe/Lisbon'
WHERE timezone IS NULL;

ALTER TABLE public.user_settings
  ALTER COLUMN timezone SET DEFAULT 'Europe/Lisbon',
  ALTER COLUMN timezone SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_settings'
      AND column_name = 'currency'
  ) THEN
    ALTER TABLE public.user_settings
      ALTER COLUMN currency SET DEFAULT 'EUR';

    UPDATE public.user_settings
    SET currency = 'EUR'
    WHERE currency IS DISTINCT FROM 'EUR';
  END IF;
END;
$$;

ALTER TABLE public.user_settings
  DROP COLUMN IF EXISTS region,
  DROP COLUMN IF EXISTS persona,
  DROP COLUMN IF EXISTS receipt_photos_enabled,
  DROP COLUMN IF EXISTS limites,
  DROP COLUMN IF EXISTS meta_diaria,
  DROP COLUMN IF EXISTS meta_mensal;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recurring_payments_user_id_id_unique'
      AND conrelid = 'public.recurring_expenses'::regclass
  ) THEN
    ALTER TABLE public.recurring_expenses
      RENAME CONSTRAINT recurring_payments_user_id_id_unique TO recurring_expenses_user_id_id_unique;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recurring_expenses_user_id_id_unique'
      AND conrelid = 'public.recurring_expenses'::regclass
  ) THEN
    ALTER TABLE public.recurring_expenses
      ADD CONSTRAINT recurring_expenses_user_id_id_unique
      UNIQUE (user_id, id);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_user_category_invariants()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_fallback AND auth.uid() IS NOT NULL THEN
      RAISE EXCEPTION 'Fallback category cannot be deleted';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Category owner cannot be changed';
    END IF;
    IF NEW.is_fallback IS DISTINCT FROM OLD.is_fallback THEN
      RAISE EXCEPTION 'Fallback flag cannot be changed';
    END IF;
    IF NEW.legacy_tag IS DISTINCT FROM OLD.legacy_tag THEN
      RAISE EXCEPTION 'Legacy category mapping cannot be changed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reset_recurring_payment_after_transaction_delete ON public.transacoes;
CREATE TRIGGER reset_recurring_payment_after_transaction_delete
  BEFORE DELETE ON public.transacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_recurring_payment_after_transaction_delete();
