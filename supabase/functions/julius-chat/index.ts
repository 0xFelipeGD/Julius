import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildPrompt } from './prompts.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HistoryItem {
  role: 'user' | 'julius'
  content: string
}

interface PromptCategory {
  id: string
  name: string
  is_fallback?: boolean
}

interface RequestBody {
  mensagem: string
  historico?: HistoryItem[]
  timezone?: string
  categories?: PromptCategory[]
}

function getLocalParts(timezone: string): { date: string; time: string } {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return {
    date: `${get('day')}/${get('month')}/${get('year')}`,
    time: `${get('hour')}:${get('minute')}`,
  }
}

async function loadUserCategories(req: Request, fallback: PromptCategory[]): Promise<PromptCategory[]> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return fallback

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  if (!supabaseUrl || !supabaseAnonKey) return fallback

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return fallback

  const { data, error } = await supabase
    .from('user_categories')
    .select('id, name, is_fallback, sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error || !data?.length) return fallback

  return data.map((category) => ({
    id: String(category.id),
    name: String(category.name),
    is_fallback: Boolean(category.is_fallback),
  }))
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body: RequestBody = await req.json()
    const { mensagem, historico = [], timezone = 'Europe/Lisbon', categories = [] } = body
    const trimmedMessage = mensagem?.trim()

    if (!trimmedMessage) {
      return new Response(JSON.stringify({
        tipo: 'conversa',
        mensagem_julius: 'Tell me what you spent and I will prepare the transaction.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) throw new Error('OPENAI_API_KEY not configured')

    const effectiveCategories = await loadUserCategories(req, categories)
    const current = getLocalParts(timezone)
    const systemPrompt = `${buildPrompt(effectiveCategories)}\n\nCurrent local date and time: ${current.date} at ${current.time}.`
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ]

    for (const item of historico.slice(-10)) {
      messages.push({
        role: item.role === 'julius' ? 'assistant' : 'user',
        content: item.content,
      })
    }

    messages.push({
      role: 'user',
      content: `[TODAY IS ${current.date} at ${current.time}] ${trimmedMessage}`,
    })

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 450,
        temperature: 0.55,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openaiRes.ok) {
      const errorBody = await openaiRes.text()
      console.error('OpenAI error:', errorBody)
      throw new Error('OpenAI request failed')
    }

    const openaiData = await openaiRes.json()
    const rawContent = openaiData.choices?.[0]?.message?.content ?? '{}'

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(rawContent)
    } catch {
      parsed = { tipo: 'conversa', mensagem_julius: rawContent }
    }

    if (!parsed.mensagem_julius) {
      parsed.mensagem_julius = 'Julius could not read that cleanly. Try again.'
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('julius-chat error:', err)
    return new Response(JSON.stringify({
      tipo: 'conversa',
      mensagem_julius: 'Julius had a technical issue. Try again.',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
