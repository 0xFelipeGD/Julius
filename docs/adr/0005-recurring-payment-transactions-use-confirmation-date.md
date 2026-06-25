# Recurring payment transactions use confirmation date

When a user confirms a Recurring Payment as paid, the generated Transaction will use the user's current local date as the Transaction date. The scheduled due date remains stored on the Recurring Payment, so Julius can distinguish when a payment was due from when the user actually recorded it as paid.
