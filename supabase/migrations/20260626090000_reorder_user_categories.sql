CREATE OR REPLACE FUNCTION public.reorder_user_categories(category_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  category_count integer;
  distinct_category_count integer;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF category_ids IS NULL THEN
    RAISE EXCEPTION 'Category order is required';
  END IF;

  SELECT count(*), count(DISTINCT input.category_id)
  INTO category_count, distinct_category_count
  FROM unnest(category_ids) AS input(category_id);

  IF category_count IS DISTINCT FROM distinct_category_count THEN
    RAISE EXCEPTION 'Category order contains duplicate categories';
  END IF;

  IF category_count IS DISTINCT FROM (
    SELECT count(*)
    FROM public.user_categories
    WHERE user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Category order must include every category';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(category_ids) AS input(category_id)
    LEFT JOIN public.user_categories category
      ON category.id = input.category_id
      AND category.user_id = current_user_id
    WHERE category.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Category order contains unknown categories';
  END IF;

  UPDATE public.user_categories category
  SET sort_order = ordered.ordinality * 10
  FROM unnest(category_ids) WITH ORDINALITY AS ordered(category_id, ordinality)
  WHERE category.id = ordered.category_id
    AND category.user_id = current_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reorder_user_categories(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reorder_user_categories(uuid[]) TO authenticated;
