# Skill: Supabase RLS Patterns

1. **Owner-only Access:**
```sql
CREATE POLICY "owner_all" ON table_name
  FOR ALL USING (auth.uid() = user_id);
```

2. **Public Read, Owner Update:**
```sql
CREATE POLICY "public_read" ON table_name
  FOR SELECT USING (true);

CREATE POLICY "owner_update" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);
```

3. **Admin-only Access:**
```sql
CREATE POLICY "admin_all" ON table_name
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```
