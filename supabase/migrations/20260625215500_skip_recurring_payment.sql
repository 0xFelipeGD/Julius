-- Allow users to skip a recurring payment for one specific generated month.

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
