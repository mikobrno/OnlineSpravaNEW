-- PŘIDÁNÍ CHYBĚJÍCÍHO SLOUPCE vote_weight DO TABULKY members
ALTER TABLE members ADD COLUMN IF NOT EXISTS vote_weight INTEGER DEFAULT 1;

-- Aktualizace existujících záznamů s prázdným vote_weight
UPDATE members SET vote_weight = 1 WHERE vote_weight IS NULL;
