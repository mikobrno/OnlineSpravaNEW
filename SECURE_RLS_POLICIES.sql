-- BEZPEČNÉ RLS POLITIKY - pouze pro přihlášené uživatele

-- Smazat stávající politiky
DROP POLICY IF EXISTS "buildings_policy" ON buildings;
DROP POLICY IF EXISTS "variables_policy" ON variables;
DROP POLICY IF EXISTS "email_templates_policy" ON email_templates;
DROP POLICY IF EXISTS "members_policy" ON members;
DROP POLICY IF EXISTS "votes_policy" ON votes;
DROP POLICY IF EXISTS "vote_options_policy" ON vote_options;
DROP POLICY IF EXISTS "cast_votes_policy" ON cast_votes;
DROP POLICY IF EXISTS "emails_policy" ON emails;

-- Politiky pouze pro authenticated uživatele (bezpečné)
CREATE POLICY "buildings_policy" ON buildings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "variables_policy" ON variables FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "email_templates_policy" ON email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "members_policy" ON members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "votes_policy" ON votes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "vote_options_policy" ON vote_options FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cast_votes_policy" ON cast_votes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "emails_policy" ON emails FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Test
SELECT 'BEZPEČNÉ RLS POLITIKY NASTAVENY ✅' as status;
