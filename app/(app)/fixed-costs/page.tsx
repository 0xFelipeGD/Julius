'use client'

import { RecurringExpensesPage } from '@/components/recurring/RecurringExpensesPage'

export default function FixedCostsPage() {
  return (
    <RecurringExpensesPage
      expenseType="fixed_cost"
      copy={{
        addButton: 'Add fixed cost',
        createTitle: 'New fixed cost',
        editTitle: 'Edit fixed cost',
        createButton: 'Create fixed cost',
        listTitle: 'Fixed costs',
        listSubtitle: 'Rent, accountant, utilities, and other monthly obligations.',
        emptyTitle: 'No fixed costs yet.',
        emptyDescription: 'Add rent, accountant fees, utilities, insurance, or any monthly obligation.',
        forecastEmpty: 'Add fixed costs to build the month forecast.',
        namePlaceholder: 'Rent, accountant, insurance',
        projectionAriaLabel: 'Projected fixed cost spend by category',
      }}
    />
  )
}
