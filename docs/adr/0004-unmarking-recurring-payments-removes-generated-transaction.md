# Unmarking recurring payments removes the generated transaction

When a user confirms a Recurring Payment as paid, Julius creates a normal Transaction linked to that payment. If the user later unmarks that payment, Julius will ask for confirmation and remove the automatically generated Transaction, because the Transaction exists as the accounting effect of that payment check. The UI must warn the user before removing it, especially if the generated Transaction has been edited.
