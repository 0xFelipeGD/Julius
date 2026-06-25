# Julius Domain

Julius is a personal finance app for tracking expenses, recurring payments, categories, and chat-assisted transaction capture for each authenticated user.

## Language

**User Account**:
An authenticated Julius user and the ownership boundary for transactions, categories, recurring expenses, settings, and chat history.
_Avoid_: Bank account, wallet, tenant

**Transaction**:
A saved expense record owned by a User Account.
_Avoid_: Entry, booking, payment

**Category**:
A user-defined label used to group Transactions and Recurring Expenses within one User Account.
_Avoid_: Tag

**Recurring Expense**:
A fixed expense or subscription that repeats monthly and can create a Transaction when the user confirms it has been paid.
_Avoid_: Signature, fixed cost

**Subscriptions**:
The user-facing app section for Recurring Expenses, even when an item is a fixed cost such as rent rather than a literal subscription.
_Avoid_: Recurring tab, Signatures

**Projected Monthly Spend**:
The total amount expected from Recurring Payments in a selected month, shown in Subscriptions before every payment has necessarily been confirmed as paid.
_Avoid_: Budget, limit

**Recurring Payment**:
The monthly payment instance for a Recurring Expense.
_Avoid_: Recurring Expense when referring to a single month

**Admin Panel**:
A restricted administration surface for Felipe's account to manage Julius users, including complete user deletion.
_Avoid_: Settings, back office

**My Account**:
The Settings surface where a signed-in user can view account details and manage account-level preferences such as timezone.
_Avoid_: Admin Panel
