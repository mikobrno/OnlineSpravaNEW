-- KONTROLA STRUKTURY TABULKY MEMBERS
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'members' 
ORDER BY ordinal_position;

-- JEDNODUCHÝ TEST PŘIDÁNÍ ČLENA S MINIMÁLNÍMI DATY
INSERT INTO members (name, email, unit_number) 
VALUES ('Test Člen 2', 'test2@email.cz', '16');
