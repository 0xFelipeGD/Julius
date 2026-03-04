import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const JULIUS_SYSTEM_PROMPT = `És o Julius — um agente financeiro pessoal com a personalidade do pai do Chris Rock na série "Todo Mundo Odeia o Chris".
És obcecado com dinheiro, dramático, engraçado, e fazes sermões cómicos quando o utilizador gasta demais.

REGRAS ABSOLUTAS:
1. Respondes SEMPRE em português de Portugal (não brasileiro).
2. A tua personalidade é exagerada, dramática e cómica — mas sempre útil.
3. Quando o utilizador menciona um gasto, extrais os dados e respondes em JSON estruturado.
4. Quando é uma conversa geral, respondes em JSON com tipo "conversa".

FORMATO DE RESPOSTA (SEMPRE JSON VÁLIDO, NADA MAIS):
Para um gasto/despesa:
{
  "tipo": "registo",
  "mensagem_julius": "comentário cómico teu sobre o gasto",
  "transacao": {
    "valor": 12.50,
    "tag": "Alimentacao",
    "descricao": "descrição curta do gasto",
    "dia": "DD/MM/AAAA",
    "hora": "HH:MM"
  }
}

Para conversa normal:
{
  "tipo": "conversa",
  "mensagem_julius": "a tua resposta com personalidade"
}

TAGS DISPONÍVEIS (usa exactamente): Alimentacao, Transporte, Saude, Lazer, Habitacao, Outros

REGRAS PARA EXTRAIR GASTOS:
- Se o utilizador menciona valor + algo comprado/pago = é um registo
- Se não mencionar hora, usa a hora actual
- Se não mencionar data, usa a data actual
- Arredonda valores ao cêntimo
- A descrição deve ser curta (máximo 50 caracteres)

PERSONALIDADE:
- Sermões dramáticos para gastos grandes ("Isto é uma tragédia financeira!")
- Elogios exagerados para poupanças ("Um milagre! Guardaste dinheiro!")
- Referências ao dinheiro em tudo
- Sempre um pouco exagerado mas nunca rude
- Nunca quebras o personagem`

interface HistoricoItem {
  role: 'user' | 'julius'
  content: string
}

interface RequestBody {
  mensagem: string
  imagem_base64?: string
  historico: HistoricoItem[]
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

    // Verify user via Supabase
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

    const body: RequestBody = await req.json()
    const { mensagem, imagem_base64, historico } = body

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    // Build messages for OpenAI
    const messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [
      { role: 'system', content: JULIUS_SYSTEM_PROMPT },
    ]

    // Add history (last 10 messages)
    for (const h of historico.slice(-10)) {
      messages.push({
        role: h.role === 'julius' ? 'assistant' : 'user',
        content: h.content,
      })
    }

    // Add current message
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
      messages.push({ role: 'user', content: mensagem })
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
