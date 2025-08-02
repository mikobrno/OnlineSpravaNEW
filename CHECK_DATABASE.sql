-- KONTROLA DATABÁZE
SELECT 'buildings' as table_name, COUNT(*) as count FROM buildings
UNION ALL
SELECT 'members', COUNT(*) FROM members
UNION ALL
SELECT 'variables', COUNT(*) FROM variables
UNION ALL
SELECT 'email_templates', COUNT(*) FROM email_templates;

-- KONTROLA STRUKTURY TABULKY MEMBERS
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'members' 
ORDER BY ordinal_position;
