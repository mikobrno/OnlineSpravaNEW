-- KOMPLETNÍ SUPABASE SETUP - Spusťte celý tento soubor najednou
-- Tento skript vytvoří a nakonfiguruje kompletní databázi pro OnlineSpravaNEW

-- ========================================
-- ČÁST 1: ZÁKLADNÍ SCHÉMA DATABÁZE
-- ========================================

-- Smazání existujících politik pro případ opakovaného spuštění
DROP POLICY IF EXISTS "buildings_policy" ON buildings;
DROP POLICY IF EXISTS "variables_policy" ON variables;
DROP POLICY IF EXISTS "email_templates_policy" ON email_templates;
DROP POLICY IF EXISTS "members_policy" ON members;
DROP POLICY IF EXISTS "votes_policy" ON votes;
DROP POLICY IF EXISTS "vote_options_policy" ON vote_options;
DROP POLICY IF EXISTS "cast_votes_policy" ON cast_votes;
DROP POLICY IF EXISTS "emails_policy" ON emails;

-- Vytvoření základních tabulek
CREATE TABLE IF NOT EXISTS buildings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS variables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('global', 'building')),
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Obecné',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  greeting VARCHAR(255),
  building_id UUID,
  unitNumber VARCHAR(50),
  voteWeight INTEGER DEFAULT 1000,
  representedByMemberId UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(255),
  type VARCHAR(100) DEFAULT 'standard',
  days_duration INTEGER,
  custom_quorum_participation INTEGER,
  custom_quorum_approval INTEGER,
  email_template VARCHAR(255),
  custom_email_subject VARCHAR(255),
  custom_email_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vote_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_id UUID NOT NULL,
  option_text VARCHAR(500) NOT NULL,
  option_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cast_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_id UUID NOT NULL,
  option_id UUID NOT NULL,
  voter_email VARCHAR(255) NOT NULL,
  voter_name VARCHAR(255),
  vote_weight INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vote_id, voter_email)
);

CREATE TABLE IF NOT EXISTS emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_id UUID,
  building_id UUID,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  template_used VARCHAR(255),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ČÁST 2: FOREIGN KEY CONSTRAINTS
-- ========================================

DO $$ 
BEGIN
    -- Members -> Buildings
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'members_building_id_fkey' 
        AND table_name = 'members'
    ) THEN
        ALTER TABLE members ADD CONSTRAINT members_building_id_fkey 
        FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL;
    END IF;

    -- Members -> Members (self-reference for representation)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'members_represented_by_fkey' 
        AND table_name = 'members'
    ) THEN
        ALTER TABLE members ADD CONSTRAINT members_represented_by_fkey 
        FOREIGN KEY (representedByMemberId) REFERENCES members(id) ON DELETE SET NULL;
    END IF;

    -- Votes -> Buildings
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'votes_building_id_fkey' 
        AND table_name = 'votes'
    ) THEN
        ALTER TABLE votes ADD CONSTRAINT votes_building_id_fkey 
        FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;
    END IF;

    -- Vote Options -> Votes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'vote_options_vote_id_fkey' 
        AND table_name = 'vote_options'
    ) THEN
        ALTER TABLE vote_options ADD CONSTRAINT vote_options_vote_id_fkey 
        FOREIGN KEY (vote_id) REFERENCES votes(id) ON DELETE CASCADE;
    END IF;

    -- Cast Votes -> Votes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cast_votes_vote_id_fkey' 
        AND table_name = 'cast_votes'
    ) THEN
        ALTER TABLE cast_votes ADD CONSTRAINT cast_votes_vote_id_fkey 
        FOREIGN KEY (vote_id) REFERENCES votes(id) ON DELETE CASCADE;
    END IF;

    -- Cast Votes -> Vote Options
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cast_votes_option_id_fkey' 
        AND table_name = 'cast_votes'
    ) THEN
        ALTER TABLE cast_votes ADD CONSTRAINT cast_votes_option_id_fkey 
        FOREIGN KEY (option_id) REFERENCES vote_options(id) ON DELETE CASCADE;
    END IF;

    -- Emails -> Votes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'emails_vote_id_fkey' 
        AND table_name = 'emails'
    ) THEN
        ALTER TABLE emails ADD CONSTRAINT emails_vote_id_fkey 
        FOREIGN KEY (vote_id) REFERENCES votes(id) ON DELETE CASCADE;
    END IF;

    -- Emails -> Buildings
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'emails_building_id_fkey' 
        AND table_name = 'emails'
    ) THEN
        ALTER TABLE emails ADD CONSTRAINT emails_building_id_fkey 
        FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ========================================
-- ČÁST 3: INDEXY PRO VÝKON
-- ========================================

CREATE INDEX IF NOT EXISTS idx_members_building_id ON members(building_id);
CREATE INDEX IF NOT EXISTS idx_members_unit_number ON members(unitNumber);
CREATE INDEX IF NOT EXISTS idx_members_vote_weight ON members(voteWeight);
CREATE INDEX IF NOT EXISTS idx_members_represented_by ON members(representedByMemberId);

CREATE INDEX IF NOT EXISTS idx_votes_building_id ON votes(building_id);
CREATE INDEX IF NOT EXISTS idx_votes_active ON votes(is_active);
CREATE INDEX IF NOT EXISTS idx_votes_type ON votes(type);
CREATE INDEX IF NOT EXISTS idx_votes_end_date ON votes(end_date);

CREATE INDEX IF NOT EXISTS idx_vote_options_vote_id ON vote_options(vote_id);
CREATE INDEX IF NOT EXISTS idx_vote_options_order ON vote_options(vote_id, option_order);

CREATE INDEX IF NOT EXISTS idx_cast_votes_vote_id ON cast_votes(vote_id);
CREATE INDEX IF NOT EXISTS idx_cast_votes_voter_email ON cast_votes(voter_email);
CREATE INDEX IF NOT EXISTS idx_cast_votes_option_id ON cast_votes(option_id);

CREATE INDEX IF NOT EXISTS idx_emails_vote_id ON emails(vote_id);
CREATE INDEX IF NOT EXISTS idx_emails_building_id ON emails(building_id);
CREATE INDEX IF NOT EXISTS idx_emails_sent_at ON emails(sent_at);

CREATE INDEX IF NOT EXISTS idx_variables_type ON variables(type);
CREATE INDEX IF NOT EXISTS idx_variables_key ON variables(key);

-- ========================================
-- ČÁST 4: ROW LEVEL SECURITY
-- ========================================

ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE cast_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Politiky (všechno povoleno pro anon - upravte podle potřeby)
CREATE POLICY "buildings_policy" ON buildings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "variables_policy" ON variables FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "email_templates_policy" ON email_templates FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "members_policy" ON members FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "votes_policy" ON votes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "vote_options_policy" ON vote_options FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "cast_votes_policy" ON cast_votes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "emails_policy" ON emails FOR ALL TO anon USING (true) WITH CHECK (true);

-- ========================================
-- ČÁST 5: ZÁKLADNÍ DATA
-- ========================================

-- Základní globální proměnné
INSERT INTO variables (key, description, type, value) VALUES
('organization_name', 'Název organizace', 'global', 'Společenství vlastníků'),
('organization_address', 'Adresa organizace', 'global', ''),
('default_quorum_participation', 'Výchozí kvórum pro účast (%)', 'global', '50'),
('default_quorum_approval', 'Výchozí kvórum pro schválení (%)', 'global', '50'),
('email_signature', 'Podpis v emailech', 'global', 'Společenství vlastníků'),
('website_url', 'URL webových stránek', 'global', 'https://www.example.cz'),
('phone_contact', 'Kontaktní telefon', 'global', '+420 123 456 789'),
('office_hours', 'Úřední hodiny', 'global', 'Po-Pá: 9:00-17:00'),
('bank_account', 'Číslo účtu', 'global', '123456789/0100'),
('voting_reminder_days', 'Dny před upozorněním na hlasování', 'global', '2'),
('default_vote_duration', 'Výchozí délka hlasování (dny)', 'global', '7')
ON CONFLICT (key) DO NOTHING;

-- Základní email šablony
INSERT INTO email_templates (name, subject, body, category) VALUES
('Základní hlasování', 
 'Nové hlasování: {{vote_title}}',
 'Vážená/ý {{greeting}} {{member_name}},

bylo vyhlášeno nové hlasování s názvem "{{vote_title}}".

Popis: {{vote_description}}

Hlasování probíhá od {{vote_start}} do {{vote_end}}.

Pro hlasování použijte odkaz v tomto emailu nebo se přihlaste do systému.

S pozdravem,
{{organization_name}}',
 'Hlasování'),

('Výsledky hlasování',
 'Výsledky hlasování: {{vote_title}}',
 'Vážená/ý {{greeting}} {{member_name}},

hlasování "{{vote_title}}" bylo ukončeno.

Celkové výsledky najdete v aplikaci nebo na webových stránkách společenství.

Děkujeme za vaši účast.

S pozdravem,
{{organization_name}}',
 'Hlasování'),

('Připomenutí hlasování',
 'Připomenutí: {{vote_title}} - ještě můžete hlasovat',
 'Vážená/ý {{greeting}} {{member_name}},

připomínáme Vám, že stále probíhá hlasování "{{vote_title}}".

Vaše hlasování jsme zatím nezaregistrovali.

Hlasování bude ukončeno: {{vote_end}}

Pro hlasování se přihlaste do systému.

S pozdravem,
{{organization_name}}',
 'Připomínky')
ON CONFLICT (name) DO NOTHING;

COMMIT;

-- ========================================
-- KONTROLNÍ DOTAZ
-- ========================================

SELECT 
    'SUPABASE SETUP DOKONČEN ✅' as status,
    (SELECT COUNT(*) FROM buildings) as budovy,
    (SELECT COUNT(*) FROM variables) as promenne,
    (SELECT COUNT(*) FROM email_templates) as sablony,
    (SELECT COUNT(*) FROM members) as clenove,
    (SELECT COUNT(*) FROM votes) as hlasovani;
