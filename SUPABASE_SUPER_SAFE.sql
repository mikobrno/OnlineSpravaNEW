-- NEJBEZPEČNĚJŠÍ VERZE - KONTROLUJE VŠECHNY SLOUPCE
-- Spustit celý skript najednou

-- KROK 1: Smazání všech existujících politik
DROP POLICY IF EXISTS "buildings_policy" ON buildings;
DROP POLICY IF EXISTS "variables_policy" ON variables;
DROP POLICY IF EXISTS "email_templates_policy" ON email_templates;
DROP POLICY IF EXISTS "members_policy" ON members;
DROP POLICY IF EXISTS "votes_policy" ON votes;
DROP POLICY IF EXISTS "vote_options_policy" ON vote_options;
DROP POLICY IF EXISTS "cast_votes_policy" ON cast_votes;
DROP POLICY IF EXISTS "emails_policy" ON emails;

-- KROK 2: Vytvoření všech tabulek BEZ foreign keys
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vote_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  option_text VARCHAR(500) NOT NULL,
  option_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cast_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_email VARCHAR(255) NOT NULL,
  voter_name VARCHAR(255),
  vote_weight INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  template_used VARCHAR(255),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KROK 3: Přidání VŠECH potřebných sloupců do všech tabulek
-- Members
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE members ADD COLUMN IF NOT EXISTS greeting VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS building_id UUID;

-- Votes
ALTER TABLE votes ADD COLUMN IF NOT EXISTS building_id UUID;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Vote Options
ALTER TABLE vote_options ADD COLUMN IF NOT EXISTS vote_id UUID;

-- Cast Votes
ALTER TABLE cast_votes ADD COLUMN IF NOT EXISTS vote_id UUID;
ALTER TABLE cast_votes ADD COLUMN IF NOT EXISTS option_id UUID;

-- Emails
ALTER TABLE emails ADD COLUMN IF NOT EXISTS vote_id UUID;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS building_id UUID;

-- KROK 4: Přidání UNIQUE constraints
DO $$ 
BEGIN
    -- Cast votes unique constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cast_votes_vote_id_voter_email_key' 
        AND table_name = 'cast_votes'
    ) THEN
        ALTER TABLE cast_votes ADD CONSTRAINT cast_votes_vote_id_voter_email_key 
        UNIQUE(vote_id, voter_email);
    END IF;
END $$;

-- KROK 5: Přidání foreign key constraints (nyní by všechny sloupce měly existovat)
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

-- KROK 6: Vytvoření indexů
CREATE INDEX IF NOT EXISTS idx_members_building_id ON members(building_id);
CREATE INDEX IF NOT EXISTS idx_votes_building_id ON votes(building_id);
CREATE INDEX IF NOT EXISTS idx_vote_options_vote_id ON vote_options(vote_id);
CREATE INDEX IF NOT EXISTS idx_cast_votes_vote_id ON cast_votes(vote_id);
CREATE INDEX IF NOT EXISTS idx_cast_votes_voter_email ON cast_votes(voter_email);
CREATE INDEX IF NOT EXISTS idx_emails_vote_id ON emails(vote_id);
CREATE INDEX IF NOT EXISTS idx_emails_building_id ON emails(building_id);

-- KROK 7: Zapnutí Row Level Security
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE cast_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- KROK 8: Vytvoření politik (všechno povoleno pro anon)
CREATE POLICY "buildings_policy" ON buildings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "variables_policy" ON variables FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "email_templates_policy" ON email_templates FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "members_policy" ON members FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "votes_policy" ON votes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "vote_options_policy" ON vote_options FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "cast_votes_policy" ON cast_votes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "emails_policy" ON emails FOR ALL TO anon USING (true) WITH CHECK (true);
