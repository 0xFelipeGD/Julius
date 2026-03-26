# Julius — Personal Finance Assistant

Julius is a mobile-first PWA for personal expense tracking. Talk to Julius in natural language, snap photos of receipts, and choose a personality that matches your vibe.

## Regions & Languages

| Region | Language | Currency | Personas |
|---|---|---|---|
| 🇧🇷 Brazil | Brazilian Portuguese | BRL (R$) | Julius, Dona Herminia, Seu Madruga |
| 🇵🇹 Portugal | European Portuguese | EUR (€) | Julius, Tia Encarnação, Fernando, Zé Povinho |
| 🇪🇺 Europe | English (GB) | EUR (€) | Julius, Mrs. Thatcher, Nonna Maria, Hans |
| 🇺🇸 United States | English (US) | USD ($) | Julius, Grandma Rose, Mr. Pennypinch, Uncle Dave |

First login shows a region selector. Region (and with it the language and currency) can be changed anytime in Settings.

## Features

- **Chat with AI** — describe expenses in natural language with relative dates; Julius interprets and creates the record
- **Receipt photos** — snap any receipt; Julius extracts amount, category, and date automatically (unlock via code in Settings)
- **Dashboard** — stacked bar chart by category/day, donut breakdown, totals and averages; filter by period and category
- **Spending limits** — daily and monthly limits per category or globally; progress bars turn red when exceeded
- **Statement** — filterable + searchable list; tap to edit, swipe to delete, export to CSV or PDF
- **Personas** — 13 personalities across 4 regions, each with unique confirm messages and chat style
- **Year selector** — in Settings, switches the active year across dashboard and statement

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js (App Router) | 16.1.6 |
| UI | React + TypeScript + Tailwind CSS | 19.2.4 / 5.9.3 / 4.2.1 |
| State | Zustand + TanStack React Query | 5.0.11 / 5.90.21 |
| Backend | Supabase (Auth, PostgreSQL, Edge Functions) | 2.98.0 |
| AI | OpenAI GPT-4o-mini (text) / GPT-4o (images) | — |
| Charts | Recharts | 3.7.0 |
| PDF | jsPDF + jspdf-autotable | 4.2.1 / 5.0.7 |
| PWA | @ducanh2912/next-pwa | 10.2.9 |
| Testing | Vitest | 4.1.0 |

## Setup

### 1. Environment variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

In Supabase dashboard → Settings → Edge Functions → Secrets:

```
OPENAI_API_KEY=sk-...
```

### 2. Database

Apply all migrations in order:

```bash
supabase db push
```

This creates:
- `transacoes` — expense records (RLS enforced)
- `chat_history` — chat messages (RLS enforced)
- `user_settings` — per-user settings: currency, limits, region, persona, receipt unlock

### 3. Edge Functions

```bash
supabase functions deploy julius-chat --no-verify-jwt
supabase functions deploy delete-account
```

> `--no-verify-jwt` is required on `julius-chat` to avoid 401 gateway errors. Data security is enforced by RLS on all tables.

### 4. Install and run

```bash
npm install
npm run dev
```

### 5. Regenerate PWA icons (optional)

If you change `public/favicon.svg`:

```bash
node scripts/generate-icons.js
```

Outputs PNG icons at all sizes to `public/icons/`.

## Project Structure

```
app/
  (app)/
    chat/          # Chat with Julius (text + receipt photo)
    dashboard/     # Charts, totals, spending limits
    extrato/       # Statement (edit, delete, search, export)
    settings/      # Region, persona, year, limits, receipt unlock, account
  (auth)/
    login/         # Supabase auth
components/
  chat/            # ChatBubble, ChatInput, TransactionConfirm, CameraCapture
  dashboard/       # StatsCards, SpendingChart, CategoryBreakdown, BudgetProgress, PeriodFilter
  extrato/         # TransactionList, TransactionItem, ExtractFilters, EditTransactionModal, SearchBar
  settings/        # RegionSelector, PersonaSelector, LimitsSection, AccountSection, HelpSection, ReceiptUnlock
  AppShell.tsx     # Main layout (header + bottom nav)
  RegionGate.tsx   # Blocks the app until region is chosen on first login
  JuliusLightbox.tsx
  TutorialModal.tsx
  IOSInstallHint.tsx
hooks/
  useJuliusChat.ts     # Chat logic, transaction confirmation, Zustand-persisted history
  useTransactions.ts   # Transactions query with filters
  useStats.ts          # Stats grouped by day (zero-spend days filled)
  useUserSettings.ts   # Load/save: region, persona, limits, receipt unlock
lib/
  categories.ts        # Single source of truth for categories
  config/
    regions.ts         # Region → locale/currency mapping (BR, PT, EU, US)
    features.ts        # Feature flags (RECEIPT_UNLOCK_CODE)
  i18n/
    types.ts           # Translations interface (~130 keys)
    index.ts           # useTranslation() hook
    locales/           # pt-PT.ts, pt-BR.ts, en-GB.ts, en-US.ts
  prompts/
    index.ts           # Persona registry: getPersona(), getPersonasForRegion()
    personas/          # 12 persona files — metadata + confirm messages (no system prompts)
  types/index.ts       # Tag, Periodo, Currency, RegionCode, Locale, UserSettings, …
  utils/               # formatCurrency, formatDate, formatTime
  pdf/
    generateReport.ts  # Locale-aware PDF export
stores/
  appStore.ts          # chatMessages (survives tab navigation), selectedYear
  userSettingsStore.ts # region, currency, persona, limits, receiptPhotosEnabled
scripts/
  generate-icons.js    # Generates PWA icon PNGs from favicon.svg via sharp
__tests__/
  lib/
    categories.test.ts
    utils/
      currency.test.ts
      date.test.ts
      period.test.ts
supabase/
  functions/
    julius-chat/
      index.ts         # Edge Function: receives region + persona_id, calls OpenAI
      prompts.ts       # All 13 persona system prompts (server-side only, not bundled)
    delete-account/
  migrations/
docs/
  PLAN_v1.3.md
  relatorios/          # Audit and quality reports
```

## How to add a new persona

1. Create `lib/prompts/personas/<name>.ts` — export a `PersonaConfig` with `id`, `name`, `tagline`, `sampleQuote`, `availableRegions`, `getConfirmMessages()`, and `getEmptyGreeting()`
2. Register it in `lib/prompts/index.ts` (import + add to `PERSONAS`)
3. Add the full system prompt to `supabase/functions/julius-chat/prompts.ts`

## How to add a new region

1. Add the region code to `RegionCode` in `lib/types/index.ts`
2. Add the config entry to `REGIONS` in `lib/config/regions.ts`
3. Create `lib/i18n/locales/<locale>.ts` implementing the `Translations` interface
4. Register it in `lib/i18n/index.ts`

## How to add a new category

1. `lib/categories.ts` — add to `CATEGORIES` with `labels` for all 4 locales
2. `lib/types/index.ts` — add to the `Tag` union type
3. `supabase/functions/julius-chat/prompts.ts` — add to the tags list in each persona prompt

## How to change the receipt unlock code

Edit `RECEIPT_UNLOCK_CODE` in `lib/config/features.ts`. Users who already unlocked are unaffected (stored per-user in `user_settings`).

## Tests

```bash
npm test            # run once
npm run test:watch  # watch mode
```

Covers `formatCurrency`, `formatDate`, `formatTime`, category helpers, and period utilities.

## Known limitations

- Data accepted from 2025-01-01 onwards (Julius rejects earlier dates)
- Maximum 3 years into the future for records
- Chat history loads last 50 messages
- PWA manifest is static — `lang` attribute is updated client-side after region loads
