-- Add 'Impostos' to the transacoes tag CHECK constraint
ALTER TABLE "public"."transacoes"
  DROP CONSTRAINT "transacoes_tag_check";

ALTER TABLE "public"."transacoes"
  ADD CONSTRAINT "transacoes_tag_check"
  CHECK ("tag" = ANY (ARRAY[
    'Alimentacao'::text,
    'Transporte'::text,
    'Saude'::text,
    'Lazer'::text,
    'Habitacao'::text,
    'Impostos'::text,
    'Outros'::text
  ]));

-- Update default for enabled_categories to include Impostos
ALTER TABLE "public"."user_settings"
  ALTER COLUMN "enabled_categories"
  SET DEFAULT ARRAY[
    'Alimentacao'::text,
    'Transporte'::text,
    'Saude'::text,
    'Lazer'::text,
    'Habitacao'::text,
    'Impostos'::text,
    'Outros'::text
  ];

-- Add Impostos to existing users who don't have it yet
UPDATE "public"."user_settings"
SET "enabled_categories" = array_append("enabled_categories", 'Impostos')
WHERE NOT ('Impostos' = ANY("enabled_categories"));
