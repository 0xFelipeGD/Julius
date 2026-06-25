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

async function assertAdmin(adminClient: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await adminClient
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
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

  if (req.method !== 'GET' && req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const caller = await getVerifiedUser(req)
    if (!caller) return json({ error: 'Invalid session' }, 401)

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const isAdmin = await assertAdmin(adminClient, caller.id)
    if (!isAdmin) return json({ error: 'Admin access required' }, 403)

    if (req.method === 'GET') {
      const { data, error } = await adminClient.auth.admin.listUsers()
      if (error) throw error

      const users = data.users.map((user) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        is_current_user: user.id === caller.id,
      }))

      return json({ users })
    }

    const body = await req.json().catch(() => ({}))
    const targetUserId = typeof body.target_user_id === 'string' ? body.target_user_id : ''
    if (!targetUserId) return json({ error: 'target_user_id is required' }, 400)
    if (targetUserId === caller.id) return json({ error: 'Use account deletion for your own account' }, 400)

    await deletePublicUserData(adminClient, targetUserId)

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId)
    if (deleteError) throw deleteError

    return json({ success: true })
  } catch (err) {
    console.error('admin-users error:', err)
    return json({ error: 'Internal error' }, 500)
  }
})
