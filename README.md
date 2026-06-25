# Julius 2.0

Julius is a mobile-first PWA for personal expense tracking in English and EUR. The product is intentionally focused: typed chat with Julius, dashboard analytics, subscriptions, fixed monthly costs, statement review, user-owned categories, and account settings.

## Product Scope

- **Chat** — text-only expense capture with confirmation before saving.
- **Dashboard** — period filters, totals, charting, and category breakdowns.
- **Subscriptions** — recurring services with due dates, paid status, confirmation, automatic transaction creation, monthly reset, projected monthly total, and a compact donut breakdown.
- **Fixed costs** — rent, accountant fees, utilities, insurance, and other monthly obligations with the same payment workflow as subscriptions.
- **Statement** — searchable, editable transaction history with CSV and PDF export.
- **Settings** — My Account, timezone, categories per user account, account deletion, and Felipe-only admin user deletion.
- **PWA install** — generated home-screen icons based on a free stock jar-with-coins image.

Removed from the active product: region switching, multiple currencies, multiple assistant personas, receipt photos, and spending limits.

## Defaults

Julius 2.0 uses:

- Language: English
- Locale: `en-GB`
- Currency: `EUR`
- Default timezone fallback: `Europe/Lisbon`
- Assistant identity: Julius only

Every existing user receives default categories during migration:

- Food
- Transport
- Health
- Leisure
- Housing
- Taxes
- Other

`Other` is the non-deletable fallback category. Deleting another category reassigns linked transactions and recurring expenses to `Other` before deletion.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS v4 tokens in `app/globals.css` |
| State | Zustand, TanStack React Query |
| Backend | Supabase Auth, PostgreSQL, Edge Functions |
| AI | OpenAI chat model through `supabase/functions/julius-chat` |
| Charts | Recharts plus CSS donut summaries |
| PDF | jsPDF and jspdf-autotable |
| PWA | `@ducanh2912/next-pwa` |
| Tests | Vitest |

## Setup

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Set Edge Function secrets in Supabase:

```bash
OPENAI_API_KEY=sk-...
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Install and run:

```bash
npm install
npm run dev
```

## Database

Local migrations for Julius 2.0 add:

- `user_categories`
- `recurring_expenses`
- `recurring_payments`
- `recurring_expenses.expense_type` to separate subscriptions from fixed costs without duplicating payment logic
- recurring/source/category metadata on `transacoes`
- monthly expiration on `chat_history`
- `admin_users`
- RPCs for recurring payment confirmation, recurring payment unmarking, and category deletion reassignment

Production migrations must be applied only after local validation and Felipe approval. The migration path preserves transactions and account-owned data, backfills categories, and removes obsolete settings columns for region, persona, receipt unlock, and spending limits.

## Edge Functions

Deploy after database migration:

```bash
supabase functions deploy julius-chat
supabase functions deploy delete-account
supabase functions deploy admin-users
```

`admin-users` and `delete-account` require the service-role secret. Admin access is checked server-side through `public.admin_users`.

## Icons

The PWA icons are generated from `public/icons/julius-stock-source.jpg`.

Source image: Towfiqu barbhuiya on Unsplash, "a glass jar filled with coins and a plant" (`joqWSI9u_XM`), used under the Unsplash License.

Regenerate icon sizes:

```bash
node scripts/generate-icons.js
```

## Project Structure

```text
app/
  (app)/
    chat/
    dashboard/
    extrato/
    fixed-costs/
    settings/
    subscriptions/
components/
  recurring/
  chat/
  dashboard/
  extrato/
hooks/
  useCategories.ts
  useJuliusChat.ts
  useSubscriptions.ts
  useTransactions.ts
  useUserSettings.ts
lib/
  categories.ts
  pdf/
  types/
  utils/
stores/
supabase/
  functions/
  migrations/
docs/
  adr/
```

## Verification

```bash
npm test
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-anon-key npm run build
```

`npm run lint` currently points to the removed `next lint` command and should be replaced with an ESLint or Biome setup before being used as a required gate.
