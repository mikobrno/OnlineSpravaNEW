-- PŘIDÁNÍ CHYBĚJÍCÍHO SLOUPCE unit_number DO TABULKY members
ALTER TABLE members ADD COLUMN IF NOT EXISTS unit_number VARCHAR(50);

-- Aktualizace existujících záznamů s prázdným unit_number
UPDATE members SET unit_number = '1' WHERE unit_number IS NULL;

-- Index pro rychlejší řazení
CREATE INDEX IF NOT EXISTS idx_members_unit_number ON members(unit_number);
