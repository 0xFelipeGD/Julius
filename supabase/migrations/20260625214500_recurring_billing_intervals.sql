-- Support non-monthly recurring expenses such as annual or every-N-month subscriptions.

ALTER TABLE public.recurring_expenses
  ADD COLUMN IF NOT EXISTS billing_interval_months integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS billing_anchor_month date;

UPDATE public.recurring_expenses
SET billing_anchor_month = date_trunc('month', created_at)::date
WHERE billing_anchor_month IS NULL;

ALTER TABLE public.recurring_expenses
  ALTER COLUMN billing_anchor_month SET DEFAULT date_trunc('month', now())::date,
  ALTER COLUMN billing_anchor_month SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'recurring_expenses_billing_interval_months_check'
      AND conrelid = 'public.recurring_expenses'::regclass
  ) THEN
    ALTER TABLE public.recurring_expenses
      ADD CONSTRAINT recurring_expenses_billing_interval_months_check
      CHECK (billing_interval_months BETWEEN 1 AND 120);
  END IF;
END;
$$;

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
