# Authorize admin users server-side

Julius 2.0 adds an Admin Panel for Felipe to delete users and all user-owned data. Admin access will be represented by an `admin_users` table keyed by Supabase `user_id`, and destructive admin actions will run through server-side Edge Functions using the service role after verifying the caller is listed as an admin. The frontend may hide admin UI for non-admin users, but it is not the authorization boundary.
