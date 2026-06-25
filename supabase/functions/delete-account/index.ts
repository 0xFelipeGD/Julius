import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function getVerifiedUser(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const jwt = authHeader.slice('Bearer '.length)
  const authClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${jwt}` } } },
  )

  const { data, error } = await authClient.auth.getUser()
  if (error || !data.user) return null
  return data.user
}

async function deletePublicUserData(adminClient: ReturnType<typeof createClient>, userId: string) {
  await adminClient.from('recurring_payments').update({ transaction_id: null }).eq('user_id', userId)
  await adminClient.from('transacoes').delete().eq('user_id', userId)
  await adminClient.from('recurring_payments').delete().eq('user_id', userId)
  await adminClient.from('recurring_expenses').delete().eq('user_id', userId)
  await adminClient.from('user_categories').delete().eq('user_id', userId)
  await adminClient.from('chat_history').delete().eq('user_id', userId)
  await adminClient.from('user_settings').delete().eq('user_id', userId)
  await adminClient.from('admin_users').delete().eq('user_id', userId)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const user = await getVerifiedUser(req)
    if (!user) return json({ error: 'Invalid session' }, 401)

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    await deletePublicUserData(adminClient, user.id)

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) throw deleteError

    return json({ success: true })
  } catch (err) {
    console.error('delete-account error:', err)
    return json({ error: 'Internal error' }, 500)
  }
})
