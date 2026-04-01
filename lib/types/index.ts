export type Tag = 'Alimentacao' | 'Transporte' | 'Saude' | 'Lazer' | 'Habitacao' | 'Impostos' | 'Outros'
export type Periodo = 'hoje' | 'semana' | 'mes' | 'trimestre' | 'total'
export type ChatRole = 'user' | 'julius'
export type MessageTipo = 'texto' | 'imagem' | 'confirmacao'
export type Currency = 'EUR' | 'BRL' | 'USD'
export type RegionCode = 'BR' | 'PT' | 'EU' | 'US'
export type Locale = 'pt-BR' | 'pt-PT' | 'en-US' | 'en-GB'

export interface LimitePeriodo {
  diario?: number | null
  mensal?: number | null
}

export type Limites = Partial<Record<Tag | 'all', LimitePeriodo>>

export interface UserSettings {
  currency: Currency
  enabled_categories: Tag[]
  limites?: Limites
  region?: RegionCode
  persona?: string
  receipt_photos_enabled?: boolean
}

export interface Transacao {
  id: string
  user_id: string
  valor: number
  tag: Tag
  descricao: string
  dia: string
  hora: string
  created_at: string
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  tipo: MessageTipo
  created_at: string
  transacao_pendente?: TransacaoPendente
}

export interface TransacaoPendente {
  valor: number
  tag: Tag
  descricao: string
  dia: string
  hora: string
}

export interface DayStats {
  dia: string
  total: number
  por_categoria: Record<Tag, number>
}

export interface JuliusChatResponse {
  tipo: 'registo' | 'conversa'
  mensagem_julius: string
  transacao?: TransacaoPendente
}
