-- Nejprve zjistíme, jaká je aktuální struktura tabulky votes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'votes' 
ORDER BY ordinal_position;

-- Zkontrolujme také, jestli tabulka votes vůbec existuje
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'votes';
