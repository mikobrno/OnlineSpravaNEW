-- AKTUALIZACE ČLENŮ TABULKY - přidání chybějících sloupců
-- Spusťte tento SQL pro přidání sloupců unitNumber a voteWeight

-- Přidání sloupců do members tabulky
ALTER TABLE members ADD COLUMN IF NOT EXISTS unitNumber VARCHAR(50);
ALTER TABLE members ADD COLUMN IF NOT EXISTS voteWeight INTEGER DEFAULT 1000;

-- Přidání indexů pro lepší výkon
CREATE INDEX IF NOT EXISTS idx_members_unit_number ON members(unitNumber);
CREATE INDEX IF NOT EXISTS idx_members_vote_weight ON members(voteWeight);

-- Aktualizace existujících záznamů (nastavení výchozí hodnoty pro voteWeight)
UPDATE members SET voteWeight = 1000 WHERE voteWeight IS NULL;

-- Aktualizace tabulky votes - přidání rozšířených sloupců pro pokročilé funkce
ALTER TABLE votes ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'standard';
ALTER TABLE votes ADD COLUMN IF NOT EXISTS days_duration INTEGER;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS custom_quorum_participation INTEGER;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS custom_quorum_approval INTEGER;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS email_template VARCHAR(255);
ALTER TABLE votes ADD COLUMN IF NOT EXISTS custom_email_subject VARCHAR(255);
ALTER TABLE votes ADD COLUMN IF NOT EXISTS custom_email_body TEXT;

-- Přidání indexů pro votes
CREATE INDEX IF NOT EXISTS idx_votes_type ON votes(type);
CREATE INDEX IF NOT EXISTS idx_votes_end_date ON votes(end_date);

COMMIT;
