'use client'

import { useState } from 'react'
import { PeriodFilter } from '@/components/dashboard/PeriodFilter'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { useStats } from '@/hooks/useStats'
import type { Periodo, Tag } from '@/lib/types'

const CATEGORY_FILTERS: { value: Tag | 'all'; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'Alimentacao', label: 'Alimentação' },
  { value: 'Outros', label: 'Outros' },
]

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [tag, setTag] = useState<Tag | 'all'>('all')

  const { data, isLoading } = useStats(periodo, tag === 'all' ? undefined : tag)

  return (
    <div className="pb-4">
      <PeriodFilter selected={periodo} onChange={setPeriodo} />

      <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-none">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTag(f.value)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              tag === f.value
                ? 'bg-julius-accent text-white'
                : 'bg-julius-card text-julius-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <StatsCards
        total={data?.total ?? 0}
        average={data?.average ?? 0}
        isLoading={isLoading}
      />

      <div className="mt-4">
        <SpendingChart data={data?.dayStats ?? []} isLoading={isLoading} />
      </div>
    </div>
  )
}
