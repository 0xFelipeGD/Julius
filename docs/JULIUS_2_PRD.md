# Julius 2.0 PRD

## Problem Statement

Julius currently carries product complexity that no longer matches the desired direction: multiple regions, currencies, languages, personas, receipt-photo capture, spending limits, and fixed built-in categories. This creates unnecessary UI surface area, makes data modeling harder, and weakens the product identity.

Julius 2.0 must become a simpler English + EUR mobile-first personal finance app with user-owned categories, first-class areas for Subscriptions and Fixed costs, cleaner account settings, monthly chat retention, timezone-aware date behavior, an admin-only user management surface for Felipe, and a full visual rework that does not look generic or AI-generated.

The highest constraint is data safety: no active user should lose transactions or account data during the transition.

## Solution

Julius 2.0 will standardize the product to English, EUR, and Julius-only chat. It will replace fixed category tags with user-owned Categories, seed default categories for every existing user, and backfill all historical Transactions to those Categories.

The new Subscriptions and Fixed costs tabs will let users create monthly recurring expenses with amount, category, payment day, and paid status. Each tab shows the selected month's projected spend, including a compact donut chart that breaks the projection down by category and paid/pending state. Confirming a monthly payment will create a normal Transaction automatically, so dashboards, statements, charts, and PDFs include it without the user needing to tell Julius in chat.

Settings will be redesigned around My Account, Categories, install/help, and account actions. Felipe's account will get a restricted Admin Panel that can delete users and all their user-owned data through server-side authorization.

The UI will be rebuilt as a light-first mobile product interface inspired by Finanzguru's calm financial command-center feel, using the `impeccable` workflow and verification to avoid generic design patterns.

## Confirmed Decisions

- A User Account is one Supabase-authenticated Julius user. Julius 2.0 will not introduce multiple bank accounts or wallets inside one user.
- Legacy transaction amounts will not be converted. Existing numeric values are preserved exactly and displayed as EUR after standardization.
- Admin authorization will be server-side through an admin allowlist table and service-role Edge Functions.
- Recurring payment days 29-31 clamp to the last day in shorter months.
- Unmarking a paid recurring payment removes the generated Transaction after confirmation.
- Generated recurring Transactions use the user's local confirmation date, while the Recurring Payment stores the scheduled due date.
- Chat history expires monthly, with a rollout grace period for existing messages.
- Julius stores a per-user timezone, detected from the browser and editable in My Account.
- Deleting a Category with history reassigns linked records to the user's fallback Category.
- Category renames update historical display because Categories are live entities.
- Each user has a non-deletable fallback Category, seeded as `Other`.
- The new bottom navigation is `Chat`, `Dashboard`, `Subscriptions`, `Fixed costs`, `Statement`, `Settings`.
- The visual direction is light-first, mobile-first, modern, and non-generic.
- The PWA/home-screen icon uses a free stock jar-with-coins image. Pixabay was evaluated first, but automated download was blocked, so the implemented asset uses an Unsplash fallback.
- Production Supabase migrations are deferred until local implementation, tests, build, schema preflight, and explicit Felipe approval.
- No push happens before Felipe tests locally.

## User Stories

1. As a user, I want Julius to use one clear language and currency, so that the app feels consistent.
2. As a user, I want the app to always use English and EUR, so that I do not need to configure region settings.
3. As a user, I want only Julius as the assistant, so that the product feels focused.
4. As a user, I want receipt-photo features removed, so that the chat stays simple and text-focused.
5. As a user, I want to create my own categories, so that Julius matches how I think about spending.
6. As a user, I want default categories created automatically, so that I can keep using the app immediately after upgrade.
7. As an existing user, I want my old transactions to keep their categories, so that my history still makes sense.
8. As an existing user, I want my old values preserved exactly, so that the migration does not silently change my finances.
9. As a user, I want to rename a category, so that my past and future views use the updated language.
10. As a user, I want to choose a category color and icon, so that charts and lists are easier to scan.
11. As a user, I want to reorder categories, so that my most-used categories are easier to access.
12. As a user, I want to delete a category, so that old category clutter does not stay forever.
13. As a user, I want deleted-category history reassigned to Other, so that no transactions disappear.
14. As a user, I want Other to always exist, so that Julius always has a safe fallback category.
15. As a user, I want a Subscriptions tab, so that recurring expenses are not hidden inside chat or settings.
16. As a user, I want to add a subscription with name, amount, category, and payment day, so that services are tracked before they happen.
17. As a user, I want a separate Fixed costs tab for rent, accountant fees, utilities, and other monthly obligations, so that they do not sit inside Subscriptions.
18. As a user, I want each recurring item to show whether it is paid this month, so that I can quickly see what remains.
19. As a user, I want a payment day of 31 to work in February, so that monthly schedules are predictable.
20. As a user, I want Julius to ask for confirmation before marking a recurring item paid, so that I do not create accidental transactions.
21. As a user, I want a paid recurring item to become a normal transaction, so that dashboards and statements include it automatically.
22. As a user, I want to unmark a recurring payment, so that mistakes can be corrected.
23. As a user, I want unmarking to remove the generated transaction after warning me, so that my totals stay accurate.
24. As a user, I want recurring transactions to use the date I actually confirmed payment, so that cashflow reflects reality.
25. As a user, I want recurring items to reset each month automatically, so that I do not need to manually recreate them.
26. As a user, I want inactive or deleted recurring items handled cleanly, so that old costs do not appear as unpaid forever.
27. As a user, I want dashboard charts to include recurring-generated transactions, so that totals are complete.
28. As a user, I want Statement to include recurring-generated transactions, so that export and review are complete.
29. As a user, I want PDF reports to include user-defined categories and recurring transactions, so that reports match the app.
30. As a user, I want CSV exports to include user-defined category names, so that exported data is readable.
31. As a user, I want chat history to clear monthly, so that the chat stays focused on the current month.
32. As an existing user, I do not want old chat history deleted immediately on rollout, so that the upgrade is not surprising.
33. As a user, I want Julius to know my timezone, so that "today", "yesterday", subscriptions, and monthly resets are correct.
34. As a user, I want timezone to be detected automatically, so that setup is low-friction.
35. As a user, I want timezone editable in My Account, so that I can correct it when I travel or detection fails.
36. As a user, I want My Account details in Settings, so that account information and preferences are easy to find.
37. As a user, I want to see my email and account details, so that I know which account is signed in.
38. As a user, I want the app install icon to be new and polished, so that it feels like Julius 2.0 on my phone.
39. As a user, I want a cleaner modern mobile UI, so that the app feels trustworthy and pleasant to use.
40. As a user, I want touch targets, sheets, and navigation to work well on phones, so that the app feels native enough.
41. As Felipe, I want a private Admin Panel, so that I can manage users.
42. As Felipe, I want to delete a user completely, so that test or unwanted accounts can be removed.
43. As Felipe, I want user deletion to remove user-owned database records too, so that the database stays clean.
44. As Felipe, I want admin actions protected server-side, so that no user can spoof admin access from the frontend.
45. As Felipe, I want all work tested locally before push, so that no unfinished Julius 2.0 changes leave the machine.
46. As a user, I want Subscriptions to show the projected spend for the month, so that I know what fixed costs are expected before they are all paid.
47. As a user, I want a small donut chart in Subscriptions, so that I can quickly see how projected recurring spend is distributed by category and payment state.

## Implementation Decisions

### Product Simplification

Julius 2.0 removes region selection, multiple locales, multiple personas, receipt photos, and spending limits from the active product. The migration path stops reading/writing those settings, standardizes existing settings to EUR, and drops obsolete settings columns for region, persona, receipt unlock, and spending limits after category backfill is in place.

The product will expose one locale and one currency behavior: English UI with EUR formatting.

### Categories

Create a user-owned Category model. Each Category belongs to exactly one User Account and includes:

- display name
- normalized name
- color
- icon
- sort order
- legacy tag mapping
- fallback marker
- timestamps

Every user receives default Categories:

- Food
- Transport
- Health
- Leisure
- Housing
- Taxes
- Other

Existing Transactions are backfilled from legacy tags into the matching user-owned Category. Other is the non-deletable fallback Category.

Deleting a Category with linked records reassigns linked Transactions and Recurring Expenses to Other before deleting the Category.

### Transactions

Transactions should move from fixed category tag behavior toward Category references. During migration, the app should be tolerant of both legacy tag data and new Category references until production data is fully backfilled.

Transactions should include source metadata so the app can distinguish manual, chat-created, recurring-created, and legacy records when needed. This metadata is informational and should not split the user experience into separate transaction types.

### Subscriptions

Subscriptions and Fixed costs are separate user-facing sections over the same recurring-expense domain. Internally, the domain distinguishes a Recurring Expense from a Recurring Payment:

- Recurring Expense: the monthly template, such as rent or Netflix.
- Recurring Payment: one monthly instance, such as Netflix for July 2026.

Recurring Expenses include:

- user owner
- category
- description
- amount
- expense type: subscription or fixed cost
- payment day
- active/deleted state
- optional notes
- timestamps

Recurring Payments include:

- user owner
- recurring expense
- month
- due date
- status
- linked transaction
- confirmation timestamp

The UI creates a Recurring Payment for the current month on demand or through a safe monthly generation flow. The monthly reset happens naturally because the next month has a new pending Recurring Payment.

Subscriptions and Fixed costs must each include a monthly projection area. For the selected month, Julius sums all active Recurring Payments expected in that tab and presents:

- projected monthly total
- paid amount
- pending amount
- compact donut chart by Category
- visual distinction between paid and pending portions

Marking a payment paid:

1. asks for confirmation
2. creates a normal Transaction using the user's current local confirmation date
3. links that Transaction to the Recurring Payment
4. marks the Recurring Payment paid

Unmarking a payment:

1. asks for confirmation
2. removes the generated Transaction
3. marks the Recurring Payment pending again

### Chat

Chat becomes text-only. The app should remove receipt photo capture and image model usage, but remain tolerant of old image chat-history rows during rendering.

Chat history will use monthly expiration. New messages receive an expiration timestamp at the next month boundary in the user's timezone. Existing messages receive a grace expiration at the next month boundary after rollout.

The Edge Function should use the user's saved timezone and server-verified categories instead of trusting client-provided category lists.

### Timezone

My Account stores a user timezone preference. Initial timezone is detected from the browser and falls back to Europe/Lisbon. Timezone affects:

- chat relative dates
- "today" in transaction confirmation
- recurring payment confirmation date
- recurring payment due dates
- monthly chat expiration
- month-boundary reset behavior

### Admin Panel

Admin access is represented server-side. Felipe's user id is seeded into an admin allowlist table after Supabase production access is configured.

The Admin Panel is visible only for admin users and supports complete user deletion. Destructive operations must run through a server-side function that verifies the caller is an admin before using elevated privileges.

User deletion must remove all user-owned data, including Transactions, Categories, Recurring Expenses, Recurring Payments, chat history, settings, and any future user-owned tables.

### My Account

Settings includes a My Account surface with:

- signed-in email
- account metadata where safely available
- timezone selector
- app install/help entry points
- logout
- reset/delete account actions where appropriate
- Admin Panel entry only when the current user is admin

### UI Rework

The UI will be rebuilt as a light-first mobile product UI:

- off-white base surfaces
- ink text
- deep purple for primary action and selection
- teal/green for positive financial states
- restrained red for destructive states
- softer category colors
- new iconography
- new PWA/home-screen icon based on the selected jar-with-coins stock image

The UI implementation must use the `impeccable` workflow. The project should get design context documents before implementation so the redesign has explicit product and visual constraints.

Primary mobile navigation:

- Chat
- Dashboard
- Subscriptions
- Statement
- Settings

### PDF And Export

PDF and CSV exports must be updated to use user-owned Category names, Category colors where applicable, EUR formatting, English labels, and recurring-generated Transactions. Removed features must disappear from help copy and README claims.

### Production Database Workflow

Do not run production migrations during initial implementation. The production workflow is:

1. Finish local implementation.
2. Run local tests and build.
3. Configure Supabase access.
4. Dump and inspect real production schema and RLS.
5. Validate migrations against the real schema.
6. Back up or otherwise establish rollback safety.
7. Apply migrations only with explicit Felipe approval.

## Proposed Modules

### Settings And Account Module

Owns user settings, My Account, timezone, admin visibility, and removed-feature cleanup.

### Category Module

Owns user Categories, default seeding assumptions, category CRUD, fallback Category behavior, and category presentation in filters, charts, transactions, and exports.

### Transaction Module

Owns transaction querying, creation, update, delete, category linking, and source metadata.

### Subscription Module

Owns Recurring Expenses, Recurring Payments, paid/unpaid flow, generated Transaction linking, monthly reset behavior, Subscriptions UI, and Fixed costs UI.

### Chat Module

Owns text-only chat, monthly retention, category-aware extraction, timezone-aware date interpretation, and removal of receipt image behavior.

### Admin Module

Owns admin authorization checks, admin UI, user search/listing, and complete user deletion.

### Design System Module

Owns visual tokens, shared controls, mobile shell, navigation, sheets, list rows, empty states, skeletons, icon usage, and PWA icon assets.

## Testing Decisions

Tests should focus on externally visible behavior and data safety, not implementation details.

### Unit Tests

Add or update tests for:

- EUR formatting with the chosen English locale.
- category normalization and fallback behavior.
- default category mapping from legacy tags.
- category deletion reassigning records to Other.
- payment-day clamping for short months.
- recurring payment paid/unpaid state transitions.
- recurring payment transaction date behavior.
- timezone helpers for month boundaries and local today.
- monthly chat expiration calculation.

### Integration Tests

Add integration-level coverage where practical for:

- loading transactions with user-owned Categories.
- creating a recurring payment transaction.
- unmarking a recurring payment and removing the generated Transaction.
- settings loading without region/persona/receipt/limits.
- admin authorization refusing non-admin users.

### Build And Static Verification

Before declaring the work ready:

- run tests
- run type checking or build
- run lint if available or replace with build diagnostics if not configured
- run local dev server
- capture screenshots across mobile widths
- run `impeccable detect` against live local pages
- verify PWA manifest and icons

### Manual Local Test Script

Felipe should be able to test locally before any push:

1. Sign in as an existing user.
2. Verify old Transactions still exist.
3. Verify default Categories exist.
4. Rename a Category and see charts/statements update.
5. Delete a Category and verify linked records move to Other.
6. Add a Subscription.
7. Mark it paid and confirm a Transaction appears.
8. Unmark it and confirm the Transaction is removed.
9. Change timezone and verify dates behave correctly.
10. Export PDF and CSV.
11. Install PWA or inspect manifest icon.
12. Sign in as Felipe and verify Admin Panel visibility.
13. Sign in as non-admin and verify Admin Panel is hidden and server-protected.

## Rollout Plan

### Phase 1: Planning Artifacts

- Maintain glossary in the root context document.
- Maintain ADRs for data and product decisions.
- Create design context before UI implementation.

### Phase 2: Local Data Model And Compatibility

- Add local migrations for new tables and columns.
- Keep legacy fields during transition.
- Implement dual-read compatibility where needed.
- Seed and backfill local test data.

### Phase 3: Product Simplification

- Remove region gate and settings.
- Remove persona selection and non-Julius prompts.
- Remove receipt photo UI and image Edge Function path.
- Remove spending limits UI and logic.
- Standardize English + EUR.

### Phase 4: Categories And Subscriptions

- Implement user Categories.
- Replace fixed category usage across chat, dashboard, statement, settings, and exports.
- Implement Subscriptions and Fixed costs tabs with the recurring payment flow.
- Implement projected monthly spend summary and donut chart in both recurring tabs.

### Phase 5: My Account And Admin

- Implement My Account details and timezone selection.
- Implement admin allowlist check.
- Implement admin user deletion flow.

### Phase 6: UI Rework

- Build shared product UI primitives.
- Rework app shell and six primary tabs.
- Replace iconography and PWA assets.
- Verify with screenshots and `impeccable`.

### Phase 7: Local Validation

- Run automated tests.
- Run production build.
- Run manual local test script.
- Felipe tests locally.

### Phase 8: Production Supabase Preflight

- Configure Supabase access.
- Dump real schema and RLS.
- Validate migrations.
- Apply only with explicit approval.

## Out Of Scope

- Multiple bank accounts, wallets, or financial institutions inside a User Account.
- Currency conversion of existing records.
- Dark mode as a separate first-release requirement.
- Receipt photo extraction.
- Multiple personas.
- Multiple regions or languages.
- Spending limits and budgets.
- Subcategories.
- Automatic category rules.
- Bank integration or automatic subscription detection.
- Pushing, PR creation, or production migration before Felipe tests locally.

## Further Notes

The current local migration history does not include a complete baseline creation of all production tables. Production Supabase schema and RLS must be treated as the source of truth before any remote migration is executed.

The current delete-account server function should be hardened as part of the admin work because privileged deletion must verify tokens server-side before using service-role capabilities.

The selected PWA icon source is the Pixabay jar-with-coins image. It should be modified and cropped for app icon use, not treated as a legal trademark or exclusive brand mark.
