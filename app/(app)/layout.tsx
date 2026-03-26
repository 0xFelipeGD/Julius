import { AppShell } from '@/components/AppShell'
import { RegionGate } from '@/components/RegionGate'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell>
      <RegionGate>
        {children}
      </RegionGate>
    </AppShell>
  )
}
