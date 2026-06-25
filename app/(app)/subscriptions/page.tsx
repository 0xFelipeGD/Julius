'use client'

import { RecurringExpensesPage } from '@/components/recurring/RecurringExpensesPage'

export default function SubscriptionsPage() {
  return (
    <RecurringExpensesPage
      expenseType="subscription"
      copy={{
        addButton: 'Add subscription',
        createTitle: 'New subscription',
        editTitle: 'Edit subscription',
        createButton: 'Create subscription',
        listTitle: 'Subscriptions',
        listSubtitle: 'Monthly services, memberships, and plans.',
        emptyTitle: 'No subscriptions yet.',
        emptyDescription: 'Add streaming, software, phone plans, memberships, and other recurring services.',
        forecastEmpty: 'Add subscriptions to build the month forecast.',
        namePlaceholder: 'Netflix, gym, phone plan',
        projectionAriaLabel: 'Projected subscription spend by category',
      }}
    />
  )
}
