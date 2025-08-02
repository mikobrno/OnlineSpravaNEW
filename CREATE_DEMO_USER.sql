-- VYTVOŘENÍ DEMO UŽIVATELE
-- Spusťte tento SQL skript v Supabase SQL editoru

-- Nejdříve vytvoříme demo uživatele přímo v auth.users tabulce
-- POZOR: Toto funguje pouze v development módu!

-- Alternativně můžete použít registrační formulář v aplikaci
-- nebo vytvořit uživatele přes Supabase Auth dashboard

SELECT 'PŘIHLAŠOVACÍ ÚDAJE:' as info;
SELECT 'Email: admin@example.com' as email;
SELECT 'Heslo: heslo123' as password;
SELECT 'Registrujte se přímo v aplikaci nebo vytvořte účet v Supabase Auth dashboard' as note;
