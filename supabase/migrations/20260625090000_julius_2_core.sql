-- Julius 2.0 core schema.
-- Additive local migration. Production application requires schema/RLS preflight.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Europe/Lisbon',
  ADD COLUMN IF NOT EXISTS avatar_data_url text,
  ADD COLUMN IF NOT EXISTS chat_background_data_url text;

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

CREATE TABLE IF NOT EXISTS public.user_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  normalized_name text NOT NULL,
  color text NOT NULL,
  icon text NOT NULL DEFAULT 'archive',
  sort_order integer NOT NULL DEFAULT 0,
  legacy_tag text,
  is_fallback boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_categories_user_id_id_unique UNIQUE (user_id, id),
  UNIQUE (user_id, normalized_name)
);

CREATE UNIQUE INDEX IF NOT EXISTS user_categories_one_fallback_per_user
  ON public.user_categories(user_id)
  WHERE is_fallback;

CREATE UNIQUE INDEX IF NOT EXISTS user_categories_legacy_tag_unique
  ON public.user_categories(user_id, legacy_tag)
  WHERE legacy_tag IS NOT NULL;

DROP TRIGGER IF EXISTS set_user_categories_updated_at ON public.user_categories;
CREATE TRIGGER set_user_categories_updated_at
  BEFORE UPDATE ON public.user_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own categories" ON public.user_categories;
CREATE POLICY "Users can read own categories"
  ON public.user_categories
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON public.user_categories;
CREATE POLICY "Users can insert own categories"
  ON public.user_categories
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_fallback = false
    AND legacy_tag IS NULL
  );

DROP POLICY IF EXISTS "Users can update own categories" ON public.user_categories;
CREATE POLICY "Users can update own categories"
  ON public.user_categories
  FOR UPDATE
  USING (auth.uid() = user_id AND is_fallback = false)
  WITH CHECK (auth.uid() = user_id AND is_fallback = false);

DROP POLICY IF EXISTS "Users can delete own categories" ON public.user_categories;

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

DROP TRIGGER IF EXISTS protect_user_category_invariants ON public.user_categories;
CREATE TRIGGER protect_user_category_invariants
  BEFORE UPDATE OR DELETE ON public.user_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_category_invariants();

INSERT INTO public.user_categories (user_id, name, normalized_name, color, icon, sort_order, legacy_tag, is_fallback)
SELECT users.id, category.name, category.normalized_name, category.color, category.icon, category.sort_order, category.legacy_tag, category.is_fallback
FROM auth.users users
CROSS JOIN (
  VALUES
    ('Food', 'food', '#2F9E6D', 'utensils', 10, 'Alimentacao', false),
    ('Transport', 'transport', '#3B76D1', 'car', 20, 'Transporte', false),
    ('Health', 'health', '#D95B59', 'heart-pulse', 30, 'Saude', false),
    ('Leisure', 'leisure', '#7551C8', 'sparkles', 40, 'Lazer', false),
    ('Housing', 'housing', '#B8872D', 'home', 50, 'Habitacao', false),
    ('Taxes', 'taxes', '#218DA3', 'landmark', 60, 'Impostos', false),
    ('Other', 'other', '#7C8191', 'archive', 70, 'Outros', true)
) AS category(name, normalized_name, color, icon, sort_order, legacy_tag, is_fallback)
ON CONFLICT (user_id, normalized_name) DO NOTHING;

ALTER TABLE public.transacoes
  ADD COLUMN IF NOT EXISTS category_id uuid,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS recurring_expense_id uuid,
  ADD COLUMN IF NOT EXISTS recurring_payment_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'transacoes_source_check'
      AND conrelid = 'public.transacoes'::regclass
  ) THEN
    ALTER TABLE public.transacoes
      ADD CONSTRAINT transacoes_source_check
      CHECK (source IN ('manual', 'chat', 'recurring', 'legacy'));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'transacoes_user_category_fk'
      AND conrelid = 'public.transacoes'::regclass
  ) THEN
    ALTER TABLE public.transacoes
      ADD CONSTRAINT transacoes_user_category_fk
      FOREIGN KEY (user_id, category_id)
      REFERENCES public.user_categories(user_id, id);
  END IF;
END;
$$;

UPDATE public.transacoes t
SET category_id = c.id
FROM public.user_categories c
WHERE t.category_id IS NULL
  AND c.user_id = t.user_id
  AND c.legacy_tag = t.tag;

UPDATE public.transacoes t
SET category_id = c.id
FROM public.user_categories c
WHERE t.category_id IS NULL
  AND c.user_id = t.user_id
  AND c.is_fallback = true;

CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  expense_type text NOT NULL DEFAULT 'subscription' CHECK (expense_type IN ('subscription', 'fixed_cost')),
  payment_day smallint NOT NULL CHECK (payment_day BETWEEN 1 AND 31),
  billing_interval_months integer NOT NULL DEFAULT 1 CHECK (billing_interval_months BETWEEN 1 AND 120),
  billing_anchor_month date NOT NULL DEFAULT date_trunc('month', now())::date,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recurring_expenses_user_id_id_unique UNIQUE (user_id, id),
  CONSTRAINT recurring_expenses_user_category_fk
    FOREIGN KEY (user_id, category_id)
    REFERENCES public.user_categories(user_id, id)
);

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

DROP TRIGGER IF EXISTS set_recurring_expenses_updated_at ON public.recurring_expenses;
CREATE TRIGGER set_recurring_expenses_updated_at
  BEFORE UPDATE ON public.recurring_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own recurring expenses" ON public.recurring_expenses;
CREATE POLICY "Users can read own recurring expenses"
  ON public.recurring_expenses
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recurring expenses" ON public.recurring_expenses;
CREATE POLICY "Users can insert own recurring expenses"
  ON public.recurring_expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recurring expenses" ON public.recurring_expenses;
CREATE POLICY "Users can update own recurring expenses"
  ON public.recurring_expenses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recurring expenses" ON public.recurring_expenses;

CREATE TABLE IF NOT EXISTS public.recurring_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recurring_expense_id uuid NOT NULL,
  month date NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'skipped')),
  transaction_id uuid,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recurring_payments_user_id_id_unique UNIQUE (user_id, id),
  UNIQUE (recurring_expense_id, month),
  CONSTRAINT recurring_payments_user_expense_fk
    FOREIGN KEY (user_id, recurring_expense_id)
    REFERENCES public.recurring_expenses(user_id, id)
    ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS set_recurring_payments_updated_at ON public.recurring_payments;
CREATE TRIGGER set_recurring_payments_updated_at
  BEFORE UPDATE ON public.recurring_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.recurring_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own recurring payments" ON public.recurring_payments;
CREATE POLICY "Users can read own recurring payments"
  ON public.recurring_payments
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recurring payments" ON public.recurring_payments;
DROP POLICY IF EXISTS "Users can update own recurring payments" ON public.recurring_payments;
DROP POLICY IF EXISTS "Users can delete own recurring payments" ON public.recurring_payments;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recurring_payments_user_id_id_unique'
      AND conrelid = 'public.recurring_payments'::regclass
  ) THEN
    ALTER TABLE public.recurring_payments
      ADD CONSTRAINT recurring_payments_user_id_id_unique
      UNIQUE (user_id, id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'transacoes_recurring_expense_fk'
      AND conrelid = 'public.transacoes'::regclass
  ) THEN
    ALTER TABLE public.transacoes
      ADD CONSTRAINT transacoes_recurring_expense_fk
      FOREIGN KEY (user_id, recurring_expense_id)
      REFERENCES public.recurring_expenses(user_id, id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'transacoes_recurring_payment_fk'
      AND conrelid = 'public.transacoes'::regclass
  ) THEN
    ALTER TABLE public.transacoes
      ADD CONSTRAINT transacoes_recurring_payment_fk
      FOREIGN KEY (user_id, recurring_payment_id)
      REFERENCES public.recurring_payments(user_id, id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recurring_payments_transaction_fk'
      AND conrelid = 'public.recurring_payments'::regclass
  ) THEN
    ALTER TABLE public.recurring_payments
      ADD CONSTRAINT recurring_payments_transaction_fk
      FOREIGN KEY (transaction_id)
      REFERENCES public.transacoes(id)
      ON DELETE SET NULL
      DEFERRABLE INITIALLY DEFERRED;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS transacoes_one_per_recurring_payment
  ON public.transacoes(recurring_payment_id)
  WHERE recurring_payment_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.reset_recurring_payment_after_transaction_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.recurring_payment_id IS NOT NULL AND OLD.source = 'recurring' THEN
    UPDATE public.recurring_payments
    SET status = 'pending',
        transaction_id = NULL,
        confirmed_at = NULL
    WHERE id = OLD.recurring_payment_id
      AND user_id = OLD.user_id
      AND transaction_id = OLD.id;
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS reset_recurring_payment_after_transaction_delete ON public.transacoes;
CREATE TRIGGER reset_recurring_payment_after_transaction_delete
  BEFORE DELETE ON public.transacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_recurring_payment_after_transaction_delete();

ALTER TABLE public.chat_history
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

ALTER TABLE public.chat_history
  ALTER COLUMN expires_at SET DEFAULT (date_trunc('month', now()) + interval '1 month');

UPDATE public.chat_history
SET expires_at = date_trunc('month', now()) + interval '1 month'
WHERE expires_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_settings_auth_user_cascade_fk'
      AND conrelid = 'public.user_settings'::regclass
  ) THEN
    ALTER TABLE public.user_settings
      ADD CONSTRAINT user_settings_auth_user_cascade_fk
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'transacoes_auth_user_cascade_fk'
      AND conrelid = 'public.transacoes'::regclass
  ) THEN
    ALTER TABLE public.transacoes
      ADD CONSTRAINT transacoes_auth_user_cascade_fk
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chat_history_auth_user_cascade_fk'
      AND conrelid = 'public.chat_history'::regclass
  ) THEN
    ALTER TABLE public.chat_history
      ADD CONSTRAINT chat_history_auth_user_cascade_fk
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE
      NOT VALID;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = check_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins can read admin users" ON public.admin_users;
CREATE POLICY "Admins can read admin users"
  ON public.admin_users
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.ensure_recurring_payments(target_month date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  month_start date := date_trunc('month', target_month)::date;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.recurring_payments (user_id, recurring_expense_id, month, due_date)
  SELECT
    expense.user_id,
    expense.id,
    month_start,
    make_date(
      extract(year from month_start)::int,
      extract(month from month_start)::int,
      LEAST(
        expense.payment_day,
        extract(day from (date_trunc('month', month_start) + interval '1 month - 1 day'))::int
      )
    )
  FROM public.recurring_expenses expense
  WHERE expense.user_id = current_user_id
    AND expense.is_active = true
    AND expense.deleted_at IS NULL
    AND month_start >= date_trunc('month', expense.billing_anchor_month)::date
    AND (
      (
        (extract(year from month_start)::int * 12 + extract(month from month_start)::int)
        - (extract(year from expense.billing_anchor_month)::int * 12 + extract(month from expense.billing_anchor_month)::int)
      ) % GREATEST(expense.billing_interval_months, 1)
    ) = 0
  ON CONFLICT (recurring_expense_id, month) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_recurring_payment(
  payment_id uuid,
  paid_date date,
  paid_time text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  payment_record public.recurring_payments%ROWTYPE;
  expense_record public.recurring_expenses%ROWTYPE;
  category_record public.user_categories%ROWTYPE;
  new_transaction_id uuid;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO payment_record
  FROM public.recurring_payments
  WHERE id = payment_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recurring payment not found';
  END IF;

  IF payment_record.status = 'paid' AND payment_record.transaction_id IS NOT NULL THEN
    RETURN payment_record.transaction_id;
  END IF;

  SELECT * INTO expense_record
  FROM public.recurring_expenses
  WHERE id = payment_record.recurring_expense_id
    AND user_id = current_user_id;

  SELECT * INTO category_record
  FROM public.user_categories
  WHERE id = expense_record.category_id
    AND user_id = current_user_id;

  INSERT INTO public.transacoes (
    user_id,
    valor,
    tag,
    category_id,
    descricao,
    dia,
    hora,
    source,
    recurring_expense_id,
    recurring_payment_id
  )
  VALUES (
    current_user_id,
    expense_record.amount,
    COALESCE(category_record.legacy_tag, 'Outros'),
    expense_record.category_id,
    expense_record.description,
    paid_date,
    paid_time,
    'recurring',
    expense_record.id,
    payment_record.id
  )
  RETURNING id INTO new_transaction_id;

  UPDATE public.recurring_payments
  SET status = 'paid',
      transaction_id = new_transaction_id,
      confirmed_at = now()
  WHERE id = payment_record.id;

  RETURN new_transaction_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.unmark_recurring_payment(payment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  payment_record public.recurring_payments%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO payment_record
  FROM public.recurring_payments
  WHERE id = payment_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recurring payment not found';
  END IF;

  IF payment_record.transaction_id IS NOT NULL THEN
    DELETE FROM public.transacoes
    WHERE id = payment_record.transaction_id
      AND user_id = current_user_id
      AND recurring_payment_id = payment_record.id
      AND recurring_expense_id = payment_record.recurring_expense_id
      AND source = 'recurring';
  END IF;

  UPDATE public.recurring_payments
  SET status = 'pending',
      transaction_id = NULL,
      confirmed_at = NULL
  WHERE id = payment_record.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.skip_recurring_payment(payment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  payment_record public.recurring_payments%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO payment_record
  FROM public.recurring_payments
  WHERE id = payment_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recurring payment not found';
  END IF;

  IF payment_record.transaction_id IS NOT NULL THEN
    DELETE FROM public.transacoes
    WHERE id = payment_record.transaction_id
      AND user_id = current_user_id
      AND recurring_payment_id = payment_record.id
      AND recurring_expense_id = payment_record.recurring_expense_id
      AND source = 'recurring';
  END IF;

  UPDATE public.recurring_payments
  SET status = 'skipped',
      transaction_id = NULL,
      confirmed_at = NULL
  WHERE id = payment_record.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_user_category(category_id_to_delete uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  fallback_category_id uuid;
  category_is_fallback boolean;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT is_fallback INTO category_is_fallback
  FROM public.user_categories
  WHERE id = category_id_to_delete
    AND user_id = current_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Category not found';
  END IF;

  IF category_is_fallback THEN
    RAISE EXCEPTION 'Fallback category cannot be deleted';
  END IF;

  SELECT id INTO fallback_category_id
  FROM public.user_categories
  WHERE user_id = current_user_id
    AND is_fallback = true;

  IF fallback_category_id IS NULL THEN
    RAISE EXCEPTION 'Fallback category missing';
  END IF;

  UPDATE public.transacoes
  SET category_id = fallback_category_id,
      tag = 'Outros'
  WHERE user_id = current_user_id
    AND category_id = category_id_to_delete;

  UPDATE public.recurring_expenses
  SET category_id = fallback_category_id
  WHERE user_id = current_user_id
    AND category_id = category_id_to_delete;

  DELETE FROM public.user_categories
  WHERE user_id = current_user_id
    AND id = category_id_to_delete;
END;
$$;
