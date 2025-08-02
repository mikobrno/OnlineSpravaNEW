-- OPRAVA DEFAULT HODNOT PRO POVINNÉ SLOUPCE
ALTER TABLE members ALTER COLUMN "voteWeight" SET DEFAULT 1;
ALTER TABLE members ALTER COLUMN "voteWeight" SET NOT NULL;

-- Aktualizace existujících NULL hodnot
UPDATE members SET "voteWeight" = 1 WHERE "voteWeight" IS NULL;
