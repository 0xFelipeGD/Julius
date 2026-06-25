# Julius 2.0 Design System

## Design Intent

Julius 2.0 is a light-first mobile finance product. It borrows the calm financial command-center posture of Finanzguru without copying its interface. The design should feel native to a phone, modern, quiet, and precise.

## Color

Use OKLCH color tokens in CSS. The palette is restrained: neutral surfaces carry most of the UI, with deep purple for primary action and teal/green for positive financial state.

Primitive direction:

- App background: warm off-white, slightly tinted toward purple.
- Primary surface: near-white with subtle warmth.
- Raised surface: clean white-tinted panel with soft shadow or border, not glass.
- Text: ink, not pure black.
- Muted text: low-chroma purple-gray.
- Border: quiet warm gray.
- Primary: deep purple.
- Primary soft: pale purple selection surface.
- Success: restrained teal/green.
- Warning: amber.
- Danger: restrained red.

Category colors should be softer than Julius 1.x and remain legible in charts, badges, and donut segments.

## Typography

Use a product sans-serif stack, keeping Inter if no stronger local option is added. Numbers should use tabular figures. The scale should be compact and fixed:

- 11px: metadata and helper labels.
- 12px: compact labels and chart annotations.
- 14px: default body and rows.
- 16px: section titles and prominent controls.
- 20-24px: key financial numbers.

Avoid oversized hero type inside the app. Use sentence case for labels and headings.

## Layout

The app is mobile-first and PWA-first. The root remains phone-framed on desktop but should look intentional, not like a tiny dark panel. Use safe-area padding for top, bottom, left, and right.

Primary navigation uses six bottom tabs:

- Chat
- Dashboard
- Subscriptions
- Fixed costs
- Statement
- Settings

Cards are allowed for financial summaries, recurring payment groups, and repeated rows, but avoid nested cards. Prefer section bands, list rows, and compact panels where possible.

## Components

Core components should share consistent vocabulary:

- App shell and bottom navigation.
- Top bar with page title and account/admin affordances when needed.
- Buttons: primary, secondary, ghost, destructive.
- Icon buttons with accessible labels.
- Form fields and selects with labels, helper text, and errors.
- Segmented controls for period/status filtering.
- Bottom sheets for edit/create flows.
- List rows for transactions, categories, subscriptions, fixed costs, and settings.
- Metric tiles for financial summaries.
- Donut chart summaries for category, projected subscription spend, and projected fixed costs.
- Empty states that teach the next action.
- Skeleton loading states.

## Motion

Motion is functional: pressed states, sheet transitions, row state changes, and chart updates. Use 150-250ms easing. Do not animate layout properties. Respect reduced motion.

## Iconography

Use one coherent icon style. Avoid scattered hand-drawn inline SVGs. The PWA icon uses a free stock jar-with-coins image as a modified app asset, cropped and generated across manifest sizes. The implemented source is the Unsplash fallback by Towfiqu barbhuiya (`joqWSI9u_XM`) after the first Pixabay candidate could not be downloaded automatically.

## Copy

Interface copy is English. Keep it short and direct. Avoid cliches, exclamation marks in success states, and jokey system text. Julius chat can be more characterful than the rest of the interface.

## Verification

Before shipping the UI work:

- Inspect iPhone SE width, modern iPhone width, tablet portrait, tablet landscape, and desktop frame.
- Run `npx -y impeccable detect --json` against the local dev URL.
- Verify touch targets, contrast, focus rings, empty states, loading states, and PWA icon rendering.
