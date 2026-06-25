# Defer production Supabase migrations until local validation

Julius 2.0 will not run production Supabase migrations during planning or initial local implementation. Production database access, schema dump, RLS verification, backup/preflight, and migration execution will happen only after the local implementation, tests, and build are ready, and only with explicit confirmation from Felipe.
