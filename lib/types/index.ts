export type Tag = 'Alimentacao' | 'Transporte' | 'Saude' | 'Lazer' | 'Habitacao' | 'Outros'
export type Periodo = 'semana' | 'quinzena' | 'mes' | 'total'
export type ChatRole = 'user' | 'julius'
export type MessageTipo = 'texto' | 'imagem' | 'confirmacao'

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
