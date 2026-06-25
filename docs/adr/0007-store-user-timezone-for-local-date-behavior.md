# Store user timezone for local date behavior

Julius 2.0 will store a `timezone` preference per User Account and use it for local-date behavior, including relative dates in chat, monthly chat expiration, Recurring Payment due dates, and confirmation dates. The app will detect the initial value from the browser with `Intl.DateTimeFormat().resolvedOptions().timeZone`, expose it in My Account, and fall back to `Europe/Lisbon` when detection fails.
