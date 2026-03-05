# Julius — Agente Financeiro Pessoal

Julius é uma PWA mobile-first para controlo de gastos pessoais. Fala com o Julius em linguagem natural, tira fotos a recibos, e ele regista tudo automaticamente com personalidade dramática.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Supabase (Auth, PostgreSQL, Edge Functions) |
| IA | OpenAI GPT-4o-mini (texto) / GPT-4o (imagens) |
| Estado | Zustand + TanStack React Query |
| Gráficos | Recharts |

## Funcionalidades

- **Chat com IA** — descreve gastos em linguagem natural, o Julius interpreta e cria o registo
- **Leitura de recibos** — tira foto a qualquer recibo, o Julius extrai o valor e categoria
- **Dashboard** — gráfico de barras por categoria/dia, totais e médias por período
- **Extrato** — lista filtrável por período e categoria, swipe para apagar, exportação CSV
- **Configurações por utilizador** — moeda (€ ou R$), categorias ativas, persistidas no Supabase

## Setup

### 1. Variáveis de ambiente

Cria `.env.local` na raiz:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Na Edge Function (Supabase dashboard → Settings → Edge Functions):
```
OPENAI_API_KEY=sk-...
```

### 2. Base de dados

Corre as migrações SQL no Supabase SQL Editor:

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

-- Configurações do utilizador (ver supabase/migrations/20240102_user_settings.sql)
```

Corre também `supabase/migrations/20240102_user_settings.sql`.

### 3. Edge Functions

Faz deploy das Edge Functions:

```bash
supabase functions deploy julius-chat
supabase functions deploy delete-account
```

### 4. Instalar e correr

```bash
npm install
npm run dev
```

## Estrutura do projeto

```
app/
  (app)/
    chat/          # Página de chat com Julius
    dashboard/     # Gráficos e estatísticas
    extrato/       # Lista de transações
    settings/      # Configurações do utilizador
  (auth)/
    login/         # Autenticação
components/
  chat/            # ChatBubble, ChatInput, TransactionConfirm, CameraCapture
  dashboard/       # StatsCards, SpendingChart, PeriodFilter
  extrato/         # TransactionList, TransactionItem, ExtractFilters
  AppShell.tsx     # Layout principal (nav + header)
  JuliusLightbox.tsx  # Modal da foto do Julius
  TutorialModal.tsx   # Tutorial de onboarding
hooks/
  useJuliusChat.ts    # Lógica do chat + confirmação de transações
  useTransactions.ts  # Query de transações
  useStats.ts         # Query de estatísticas
  useUserSettings.ts  # Sync de configurações com Supabase
lib/
  categories.ts    # FONTE ÚNICA de categorias (editar aqui para adicionar/remover)
  types/           # Tipos TypeScript
  utils/           # formatCurrency, formatTime
  supabase/        # Client, server, middleware
stores/
  authStore.ts           # Estado de autenticação (Zustand)
  userSettingsStore.ts   # Estado das configurações (Zustand)
supabase/
  functions/
    julius-chat/   # Edge Function principal (prompt do Julius + OpenAI)
    delete-account/ # Edge Function para eliminar conta
  migrations/      # SQL migrations
```

## Adicionar uma categoria nova

1. `lib/categories.ts` — adicionar ao array `CATEGORIES`
2. `lib/types/index.ts` — adicionar ao tipo `Tag`
3. `supabase/functions/julius-chat/index.ts` — adicionar às `TAGS DISPONÍVEIS` no prompt

## Personalidade do Julius

O Julius tem a personalidade do "pai do Chris Rock em Todo Mundo Odeia o Chris" — dramático, cómico, obcecado com dinheiro. O prompt está em `supabase/functions/julius-chat/index.ts` na constante `JULIUS_SYSTEM_PROMPT`.
