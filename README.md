# Julius — Agente Financeiro Pessoal

Julius é uma PWA mobile-first para controlo de gastos pessoais. Fala com o Julius em linguagem natural, tira fotos a recibos, e ele regista tudo automaticamente com personalidade dramática.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS v4 |
| Backend | Supabase (Auth, PostgreSQL, Edge Functions) |
| IA | OpenAI GPT-4o-mini (texto) / GPT-4o (imagens/recibos) |
| Estado | Zustand + TanStack React Query |
| Gráficos | Recharts |

## Funcionalidades

- **Chat com IA** — descreve gastos em linguagem natural com datas relativas ("ontem", "na sexta", "dia 1 de março"); o Julius interpreta e cria o registo
- **Leitura de recibos** — tira foto a qualquer recibo, o Julius extrai valor, categoria e data automaticamente
- **Dashboard** — gráfico de barras empilhadas por categoria/dia (scrollável), donut chart por categoria, totais e médias; filtra por período, categoria e ano
- **Limites de gasto** — define limites diários e mensais por categoria (ou no geral); barras de progresso no dashboard ficam vermelhas ao ultrapassar
- **Extrato** — lista filtrável por período, categoria e ano; toque para editar, swipe para apagar, exportação CSV
- **Edição de transações** — edita valor, categoria, descrição e data de qualquer registo directamente no extrato
- **Configurações por utilizador** — moeda (€ ou R$), limites por categoria; persistidas no Supabase

## Setup

### 1. Variáveis de ambiente

Cria `.env.local` na raiz:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Na Edge Function (Supabase dashboard → Settings → Edge Functions → Secrets):
```
OPENAI_API_KEY=sk-...
```

### 2. Base de dados

Corre as migrações no Supabase SQL Editor ou via CLI:

```sql
-- Tabela de transações
CREATE TABLE transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  valor NUMERIC(10,2) NOT NULL,
  tag TEXT NOT NULL,
  descricao TEXT NOT NULL,
  dia DATE NOT NULL,
  hora TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own transacoes" ON transacoes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Histórico do chat
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tipo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own chat_history" ON chat_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

Corre também todas as migrações em `supabase/migrations/` pela ordem:

```bash
supabase db push
```

### 3. Edge Functions

```bash
supabase functions deploy julius-chat --no-verify-jwt
supabase functions deploy delete-account
```

> A flag `--no-verify-jwt` é necessária na `julius-chat` para evitar erros 401 do gateway do Supabase. A segurança dos dados é garantida por RLS nas tabelas.

### 4. Instalar e correr

```bash
npm install
npm run dev
```

## Estrutura do projeto

```
app/
  (app)/
    chat/          # Chat com Julius (texto + foto)
    dashboard/     # Gráficos, totais, limites de gasto
    extrato/       # Lista de transações (editar, apagar, exportar CSV)
    settings/      # Moeda, limites por categoria, conta
  (auth)/
    login/         # Autenticação Supabase
components/
  chat/            # ChatBubble, ChatInput, TransactionConfirm, CameraCapture
  dashboard/       # StatsCards, SpendingChart, CategoryBreakdown, BudgetProgress, PeriodFilter
  extrato/         # TransactionList, TransactionItem, ExtractFilters, EditTransactionModal
  AppShell.tsx     # Layout principal (header + nav com pill indicator)
  JuliusLightbox.tsx  # Modal da foto do Julius
  TutorialModal.tsx   # Tutorial de onboarding (6 passos)
hooks/
  useJuliusChat.ts    # Lógica do chat, confirmação, persistência localStorage
  useTransactions.ts  # Query de transações com filtros
  useStats.ts         # Query de estatísticas agrupadas por dia
  useUserSettings.ts  # Sync de configurações com Supabase
lib/
  categories.ts    # FONTE ÚNICA de categorias (editar aqui para adicionar/remover)
  types/           # Tipos TypeScript (Tag, Periodo, Limites, etc.)
  utils/           # formatCurrency, formatDate, formatTime
  supabase/        # Client, server, middleware
stores/
  authStore.ts           # Estado de autenticação (Zustand)
  userSettingsStore.ts   # Moeda + limites por categoria (Zustand)
supabase/
  functions/
    julius-chat/    # Edge Function: prompt do Julius + OpenAI (--no-verify-jwt)
    delete-account/ # Edge Function: eliminar conta
  migrations/       # SQL migrations (aplicar em ordem com supabase db push)
```

## Adicionar uma categoria nova

1. `lib/categories.ts` — adicionar ao array `CATEGORIES`
2. `lib/types/index.ts` — adicionar ao tipo `Tag`
3. `supabase/functions/julius-chat/index.ts` — adicionar às `TAGS DISPONÍVEIS` no prompt

## Filtros de período

| Opção | Intervalo |
|---|---|
| Hoje | Dia actual |
| Essa semana | Domingo a sábado da semana corrente |
| Esse mês | 1º ao último dia do mês corrente |
| Esse trimestre | Trimestre corrente (Jan–Mar, Abr–Jun, Jul–Set, Out–Dez) |
| Tudo | 1 Jan a 31 Dez do ano seleccionado |

## Personalidade do Julius

O Julius tem a personalidade do "pai do Chris Rock em Todo Mundo Odeia o Chris" — dramático, cómico, obcecado com dinheiro. O prompt completo está em `supabase/functions/julius-chat/index.ts` na constante `JULIUS_SYSTEM_PROMPT`.

## Limitações conhecidas

- Só suporta dados a partir de 2025-01-01 (Julius rejeita datas anteriores)
- Máximo de 3 anos no futuro para registos
- Histórico do chat carregado: últimas 50 mensagens
