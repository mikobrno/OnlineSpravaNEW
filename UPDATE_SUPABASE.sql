-- KOMPLETNÍ DATABÁZOVÉ SCHÉMA PRO HLASOVACÍ SYSTÉM S DOMY
-- Opravujeme názvy sloupců a vytváříme kompletní strukturu

-- Nejdříve přejmenujeme sloupec buildingid na buildingId (pokud existuje)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'buildingid') THEN
        ALTER TABLE members RENAME COLUMN buildingid TO "building_id";
    END IF;
END $$;

-- Přidání chybějících sloupců do members tabulky (pokud neexistují)
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE members ADD COLUMN IF NOT EXISTS greeting VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS building_id UUID;

-- Vytvoření tabulky budov
CREATE TABLE IF NOT EXISTS buildings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření tabulky proměnných (globální a pro budovy)
CREATE TABLE IF NOT EXISTS variables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('global', 'building')),
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření tabulky email šablon (globální)
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Obecné',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření tabulky hlasování (přiřazená k budovám)
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření tabulky možností hlasování
CREATE TABLE IF NOT EXISTS vote_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  option_text VARCHAR(500) NOT NULL,
  option_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření tabulky odevzdaných hlasů
CREATE TABLE IF NOT EXISTS cast_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES vote_options(id) ON DELETE CASCADE,
  voter_email VARCHAR(255) NOT NULL,
  voter_name VARCHAR(255),
  vote_weight INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vote_id, voter_email) -- Jeden hlas na osobu na hlasování
);

-- Vytvoření tabulky pro historii emailů
CREATE TABLE IF NOT EXISTS emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_id UUID REFERENCES votes(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  template_used VARCHAR(255),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY pro všechny tabulky
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE cast_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- POLITIKY pro všechny tabulky (všechno povoleno pro anon)
DROP POLICY IF EXISTS "buildings_policy" ON buildings;
DROP POLICY IF EXISTS "variables_policy" ON variables;
DROP POLICY IF EXISTS "email_templates_policy" ON email_templates;
DROP POLICY IF EXISTS "members_policy" ON members;
DROP POLICY IF EXISTS "votes_policy" ON votes;
DROP POLICY IF EXISTS "vote_options_policy" ON vote_options;
DROP POLICY IF EXISTS "cast_votes_policy" ON cast_votes;
DROP POLICY IF EXISTS "emails_policy" ON emails;

CREATE POLICY "buildings_policy" ON buildings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "variables_policy" ON variables FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "email_templates_policy" ON email_templates FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "members_policy" ON members FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "votes_policy" ON votes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "vote_options_policy" ON vote_options FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "cast_votes_policy" ON cast_votes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "emails_policy" ON emails FOR ALL TO anon USING (true) WITH CHECK (true);

-- Indexy pro lepší výkon
CREATE INDEX IF NOT EXISTS idx_members_building_id ON members(building_id);
CREATE INDEX IF NOT EXISTS idx_votes_building_id ON votes(building_id);
CREATE INDEX IF NOT EXISTS idx_votes_active ON votes(is_active);
CREATE INDEX IF NOT EXISTS idx_vote_options_vote_id ON vote_options(vote_id);
CREATE INDEX IF NOT EXISTS idx_cast_votes_vote_id ON cast_votes(vote_id);
CREATE INDEX IF NOT EXISTS idx_cast_votes_voter_email ON cast_votes(voter_email);
CREATE INDEX IF NOT EXISTS idx_emails_vote_id ON emails(vote_id);
CREATE INDEX IF NOT EXISTS idx_emails_building_id ON emails(building_id);

-- Oprava foreign key pro members na buildings
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_building_id_fkey;
ALTER TABLE members ADD CONSTRAINT members_building_id_fkey 
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL;
