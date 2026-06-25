# Clamp recurring payment days to month end

Recurring Expenses can use payment days from 1 to 31. When a selected day does not exist in a month, Julius will use the last calendar day of that month, so a payment day of 31 becomes February 28 or February 29 in leap years and April 30 in April. This keeps monthly recurrence predictable without requiring users to configure special cases for short months.
