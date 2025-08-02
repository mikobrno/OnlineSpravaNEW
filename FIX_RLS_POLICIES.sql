-- OPRAVA RLS POLITIK - zajistí plný přístup pro anon uživatele

-- Smazat stávající politiky
DROP POLICY IF EXISTS "buildings_policy" ON buildings;
DROP POLICY IF EXISTS "variables_policy" ON variables;
DROP POLICY IF EXISTS "email_templates_policy" ON email_templates;
DROP POLICY IF EXISTS "members_policy" ON members;
DROP POLICY IF EXISTS "votes_policy" ON votes;
DROP POLICY IF EXISTS "vote_options_policy" ON vote_options;
DROP POLICY IF EXISTS "cast_votes_policy" ON cast_votes;
DROP POLICY IF EXISTS "emails_policy" ON emails;

-- Vytvořit nové, plně otevřené politiky pro anon uživatele
CREATE POLICY "buildings_policy" ON buildings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "variables_policy" ON variables FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "email_templates_policy" ON email_templates FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "members_policy" ON members FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "votes_policy" ON votes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "vote_options_policy" ON vote_options FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "cast_votes_policy" ON cast_votes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "emails_policy" ON emails FOR ALL TO anon USING (true) WITH CHECK (true);

-- Vytvořit také politiky pro authenticated uživatele (pro budoucnost)
CREATE POLICY "buildings_auth_policy" ON buildings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "variables_auth_policy" ON variables FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "email_templates_auth_policy" ON email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "members_auth_policy" ON members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "votes_auth_policy" ON votes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vote_options_auth_policy" ON vote_options FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cast_votes_auth_policy" ON cast_votes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "emails_auth_policy" ON emails FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Test - zkusit načíst data
SELECT 'RLS POLITIKY OPRAVENY ✅' as status;
SELECT COUNT(*) as pocet_budov FROM buildings;
SELECT COUNT(*) as pocet_promennych FROM variables;
