# Database Rules & Patterns
# Version: 1.0.0

## Migrations
- Generate migrations via Supabase CLI: `supabase migration new your_migration_name`
- ALWAYS apply RLS to new tables.

### RLS Standard
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Owner can read/write their own data
CREATE POLICY "owner_all" ON table_name
  FOR ALL USING (auth.uid() = user_id);
```

## TypeScript Types
- Regenerate types after migrations:
  `supabase gen types typescript --local > packages/db/src/types/database.ts`

## Edge/Server Clients
Use the exported helpers rather than `@supabase/supabase-js` directly where applicable. (Location TBD based on Next config, usually `lib/supabase/server.ts`).
