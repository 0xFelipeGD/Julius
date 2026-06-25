-- Split recurring monthly expenses into Subscriptions and Fixed costs.

ALTER TABLE public.recurring_expenses
  ADD COLUMN IF NOT EXISTS expense_type text NOT NULL DEFAULT 'subscription';

UPDATE public.recurring_expenses
SET expense_type = 'subscription'
WHERE expense_type IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recurring_expenses_expense_type_check'
      AND conrelid = 'public.recurring_expenses'::regclass
  ) THEN
    ALTER TABLE public.recurring_expenses
      ADD CONSTRAINT recurring_expenses_expense_type_check
      CHECK (expense_type IN ('subscription', 'fixed_cost'));
  END IF;
END;
$$;
