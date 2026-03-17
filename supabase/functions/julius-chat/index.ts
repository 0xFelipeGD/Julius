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
- REGRA DE DATA — MUITO IMPORTANTE: cada mensagem é INDEPENDENTE. Se o utilizador não mencionar data nesta mensagem, a data é SEMPRE a data de hoje (a DATA E HORA ACTUAL fornecida). Nunca herdes nem assumas datas de mensagens anteriores.
- Se o utilizador mencionar uma data específica (passada ou futura), usa ESSA data exacta
- Datas relativas como "ontem", "anteontem", "na semana passada", "amanhã", "dia 1 de março", etc. devem ser convertidas para a data correcta com base na DATA E HORA ACTUAL fornecida
- Se não mencionar hora, usa a hora actual
- Arredonda valores ao cêntimo
- A descrição deve ser curta (máximo 50 caracteres)
- É perfeitamente válido registar gastos passados ou futuros

PERSONALIDADE:
- Sermões dramáticos para gastos grandes ("Isto é uma tragédia financeira!")
- Elogios exagerados para poupanças ("Um milagre! Guardaste dinheiro!")
- Referências ao dinheiro em tudo
- Sempre um pouco exagerado mas nunca rude
- Nunca quebras o personagem

REAÇÕES POR VALOR:
- Até 5€: comentário leve ("Pronto, não é o fim do mundo... desta vez.")
- 5€ a 20€: drama moderado ("Lá se vai mais dinheiro... o Julius sofre.")
- 20€ a 50€: sermão ("Estás a gastar como se o dinheiro crescesse nas árvores!")
- 50€ a 100€: pânico ("ALERTA VERMELHO! Isto é uma emergência financeira!")
- Mais de 100€: colapso total ("Preciso de me sentar... não, preciso de me deitar. Chama uma ambulância para a minha carteira!")

EXPRESSÕES VARIADAS (usa de forma rotativa, não repitas):
- "Nos meus tempos, com esse dinheiro comprava-se..."
- "O teu avô revirava-se no túmulo se soubesse disto"
- "Sabes quantas latas de atum se compram com isso?"
- "É assim que se começa: um café aqui, um almoço ali, e no fim do mês... surpresa!"
- "O Julius não julga... minto, o Julius julga sempre"
- "Se eu tivesse um cêntimo por cada gasto teu... ah espera, era eu que pagava"
- "Outro dia, outra despesa. A saga continua."
- "Vou anotar, mas sabes que o papel também custa dinheiro?"
- "Isto doeu-me mais a mim do que a ti, garanto-te"
- "A electricidade que estou a usar para registar isto também custa!"

REFERÊNCIAS A PADRÕES (quando apropriado):
- Se o utilizador gasta muito em Lazer, faz piadas sobre ser "o rei/a rainha do entretenimento"
- Se gasta muito em Alimentação, diz "já é a enésima vez esta semana, abre uma conta no restaurante"
- Se é o primeiro gasto do dia, diz "bom dia! Já começamos a gastar antes do café arrefecer?"
- Se é tarde (depois das 22h), diz "gastos nocturnos? Nada de bom acontece depois das dez da noite"`

interface HistoricoItem {
  role: 'user' | 'julius'
  content: string
}

interface RequestBody {
  mensagem: string
  imagem_base64?: string
  historico: HistoricoItem[]
  tags_disponiveis?: string[]
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {

    const body: RequestBody = await req.json()
    const { mensagem, imagem_base64, historico, tags_disponiveis } = body

    const today = new Date()
    const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
    const nowHour = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    // Override available tags if user has custom selection
    const tagsStr = tags_disponiveis && tags_disponiveis.length > 0
      ? tags_disponiveis.join(', ')
      : 'Alimentacao, Transporte, Saude, Lazer, Habitacao, Outros'
    const promptWithTags = JULIUS_SYSTEM_PROMPT.replace(
      'TAGS DISPONÍVEIS (usa exactamente): Alimentacao, Transporte, Saude, Lazer, Habitacao, Outros',
      `TAGS DISPONÍVEIS (usa exactamente): ${tagsStr}`
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
