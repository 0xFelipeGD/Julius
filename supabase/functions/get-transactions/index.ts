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
    default:
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
    const page = parseInt(url.searchParams.get('page') ?? '1')
    const limit = parseInt(url.searchParams.get('limit') ?? '50')
    const offset = (page - 1) * limit

    const { from, to } = getPeriodRange(periodo)

    let query = supabase
      .from('transacoes')
      .select('*', { count: 'exact' })
      .gte('dia', from)
      .lte('dia', to)
      .order('dia', { ascending: false })
      .order('hora', { ascending: false })
      .range(offset, offset + limit - 1)

    if (tag) {
      query = query.eq('tag', tag)
    }

    const { data, error, count } = await query
    if (error) throw error

    return new Response(JSON.stringify({ data, count, page, limit }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('get-transactions error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
