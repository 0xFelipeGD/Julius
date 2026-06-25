export type LegacyTag = 'Alimentacao' | 'Transporte' | 'Saude' | 'Lazer' | 'Habitacao' | 'Impostos' | 'Outros'
export type Tag = LegacyTag
export type Period = 'today' | 'week' | 'month' | 'quarter' | 'year'
export type Periodo = 'hoje' | 'semana' | 'mes' | 'trimestre' | 'total'
export type ChatRole = 'user' | 'julius'
export type MessageTipo = 'texto' | 'confirmacao'
export type Currency = 'EUR'
export type Locale = 'en-GB'
export type TransactionSource = 'manual' | 'chat' | 'recurring' | 'legacy'
export type RecurringPaymentStatus = 'pending' | 'paid' | 'skipped'
export type RecurringExpenseType = 'subscription' | 'fixed_cost'

export interface Category {
  id: string
  user_id: string
  name: string
  normalized_name: string
  color: string
  icon: string
  sort_order: number
  legacy_tag?: LegacyTag | null
  is_fallback: boolean
  created_at?: string
  updated_at?: string
}

export interface CategoryInput {
  name: string
  color: string
  icon: string
}

export interface UserSettings {
  currency: Currency
  timezone: string
  avatar_data_url?: string | null
  chat_background_data_url?: string | null
}

export interface Transaction {
  id: string
  user_id: string
  valor: number
  tag?: LegacyTag | null
  category_id?: string | null
  descricao: string
  dia: string
  hora: string
  source?: TransactionSource | null
  recurring_expense_id?: string | null
  recurring_payment_id?: string | null
  created_at: string
  category?: Category | null
}

export type Transacao = Transaction

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
  tag?: LegacyTag
  category_id?: string
  category_name?: string
  descricao: string
  dia: string
  hora: string
}

export interface DayStats {
  dia: string
  total: number
  por_categoria: Record<string, number>
}

export interface JuliusChatResponse {
  tipo: 'registo' | 'conversa'
  mensagem_julius: string
  transacao?: TransacaoPendente
}

export interface RecurringExpense {
  id: string
  user_id: string
  category_id: string
  description: string
  amount: number
  expense_type: RecurringExpenseType
  payment_day: number
  billing_interval_months: number
  billing_anchor_month: string
  is_active: boolean
  notes?: string | null
  deleted_at?: string | null
  created_at: string
  updated_at?: string
  category?: Category | null
  current_payment?: RecurringPayment | null
}

export interface RecurringPayment {
  id: string
  user_id: string
  recurring_expense_id: string
  month: string
  due_date: string
  status: RecurringPaymentStatus
  transaction_id?: string | null
  confirmed_at?: string | null
  created_at: string
  updated_at?: string
}

export interface AdminUser {
  user_id: string
  created_at: string
}
