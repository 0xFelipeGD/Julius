import { getPrompt } from './prompts.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HistoricoItem {
  role: 'user' | 'julius'
  content: string
}

interface RequestBody {
  mensagem: string
  imagem_base64?: string
  historico: HistoricoItem[]
  tags_disponiveis?: string[]
  region?: string
  persona_id?: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {

    const body: RequestBody = await req.json()
    const { mensagem, imagem_base64, historico, tags_disponiveis, region, persona_id } = body

    const today = new Date()
    const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
    const nowHour = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    // Select prompt based on persona and region
    const basePrompt = getPrompt(persona_id, region)

    // Override available tags if user has custom selection
    const tagsStr = tags_disponiveis && tags_disponiveis.length > 0
      ? tags_disponiveis.join(', ')
      : 'Alimentacao, Transporte, Saude, Lazer, Habitacao, Impostos, Outros'
    const promptWithTags = basePrompt.includes('TAGS DISPONÍVEIS')
      ? basePrompt.replace(
          'TAGS DISPONÍVEIS (usa exactamente): Alimentacao, Transporte, Saude, Lazer, Habitacao, Impostos, Outros',
          `TAGS DISPONÍVEIS (usa exactamente): ${tagsStr}`
        )
      : basePrompt.replace(
          'AVAILABLE TAGS (use exactly): Alimentacao, Transporte, Saude, Lazer, Habitacao, Impostos, Outros',
          `AVAILABLE TAGS (use exactly): ${tagsStr}`
        )

    // Build messages for OpenAI
    const systemWithDate = `${promptWithTags}\n\nDATA E HORA ACTUAL: ${todayStr} às ${nowHour}`
    const messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [
      { role: 'system', content: systemWithDate },
    ]

    // Add history (last 10 messages)
    for (const h of historico.slice(-10)) {
      messages.push({
        role: h.role === 'julius' ? 'assistant' : 'user',
        content: h.content,
      })
    }

    // Add current message — sempre com data explícita para evitar que Julius herde contexto anterior
    if (imagem_base64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: mensagem || 'Analisa este recibo/conta e extrai o gasto.' },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imagem_base64}` },
          },
        ],
      })
    } else {
      messages.push({ role: 'user', content: `[HOJE É ${todayStr} às ${nowHour}] ${mensagem}` })
    }

    // Call OpenAI
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imagem_base64 ? 'gpt-4o' : 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      console.error('OpenAI error:', err)
      throw new Error('Falha na chamada à OpenAI')
    }

    const openaiData = await openaiRes.json()
    const rawContent = openaiData.choices?.[0]?.message?.content ?? '{}'

    let parsed: { tipo: string; mensagem_julius: string; transacao?: Record<string, unknown> }
    try {
      parsed = JSON.parse(rawContent)
    } catch {
      parsed = { tipo: 'conversa', mensagem_julius: rawContent }
    }

    // Validate structure
    if (!parsed.mensagem_julius) {
      parsed.mensagem_julius = 'O Julius ficou sem palavras... temporariamente.'
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('julius-chat error:', err)
    return new Response(
      JSON.stringify({
        tipo: 'conversa',
        mensagem_julius: 'O Julius teve um problema técnico. Até eu erro às vezes... mas não com o dinheiro.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
