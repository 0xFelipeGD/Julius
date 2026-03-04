import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getPeriodRange(periodo: string): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString().split('T')[0]
  let from: Date

  switch (periodo) {
    case 'semana':
      from = new Date(now)
      from.setDate(from.getDate() - 7)
      break
    case 'quinzena':
      from = new Date(now)
      from.setDate(from.getDate() - 15)
      break
    case 'mes':
      from = new Date(now)
      from.setMonth(from.getMonth() - 1)
      break
    default: // total
      from = new Date('2020-01-01')
  }

  return { from: from.toISOString().split('T')[0], to }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const periodo = url.searchParams.get('periodo') ?? 'mes'
    const tag = url.searchParams.get('tag')

    const { from, to } = getPeriodRange(periodo)

    let query = supabase
      .from('transacoes')
      .select('*')
      .gte('dia', from)
      .lte('dia', to)
      .order('dia', { ascending: true })

    if (tag) {
      query = query.eq('tag', tag)
    }

    const { data, error } = await query
    if (error) throw error

    const transactions = data ?? []
    const ALL_TAGS = ['Alimentacao', 'Transporte', 'Saude', 'Lazer', 'Habitacao', 'Outros']

    // Group by day
    const grouped = new Map<string, Map<string, number>>()
    for (const t of transactions) {
      if (!grouped.has(t.dia)) {
        grouped.set(t.dia, new Map())
      }
      const dayMap = grouped.get(t.dia)!
      dayMap.set(t.tag, (dayMap.get(t.tag) ?? 0) + Number(t.valor))
    }

    const dayStats = Array.from(grouped.entries()).map(([dia, catMap]) => {
      const por_categoria: Record<string, number> = {}
      for (const cat of ALL_TAGS) {
        por_categoria[cat] = catMap.get(cat) ?? 0
      }
      const total = Array.from(catMap.values()).reduce((a, b) => a + b, 0)
      return { dia, total, por_categoria }
    })

    const total = dayStats.reduce((sum, d) => sum + d.total, 0)
    const days = dayStats.length || 1
    const average = total / days

    return new Response(JSON.stringify({ dayStats, total, average }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('get-stats error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
