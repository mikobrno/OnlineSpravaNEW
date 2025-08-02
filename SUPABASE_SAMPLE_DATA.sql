-- SUPABASE SAMPLE DATA - Ukázková data pro testování
-- Spusťte tento SQL po vytvoření základního schématu (SUPABASE_FINAL.sql)

-- Přidání testovacích budov
INSERT INTO buildings (name, data) VALUES 
('Dům Na Petřinách 123', '{
  "address": "Na Petřinách 123",
  "city": "Praha 6",
  "postal_code": "160 00",
  "units_count": 12,
  "common_areas": ["dvorek", "sklep", "půda"],
  "representative_email": "sprava@napetrinach123.cz",
  "representative_phone": "+420 123 456 789"
}'),
('Bytový dům Vinohrady', '{
  "address": "Korunní 456", 
  "city": "Praha 2",
  "postal_code": "120 00",
  "units_count": 8,
  "common_areas": ["vstupní hala", "výtah"],
  "representative_email": "admin@vinohrady456.cz",
  "representative_phone": "+420 987 654 321"
}');

-- Získání ID budov pro další operace
DO $$
DECLARE
    building1_id UUID;
    building2_id UUID;
    template1_id UUID;
    template2_id UUID;
BEGIN
    -- Získání ID budov
    SELECT id INTO building1_id FROM buildings WHERE name = 'Dům Na Petřinách 123';
    SELECT id INTO building2_id FROM buildings WHERE name = 'Bytový dům Vinohrady';
    
    -- Přidání testovacích členů pro první dům
    INSERT INTO members (email, name, phone, greeting, building_id, unitNumber, voteWeight) VALUES
    ('jan.novak@email.cz', 'Jan Novák', '+420 123 456 789', 'pan', building1_id, '1/1', 1200),
    ('marie.svobodova@email.cz', 'Marie Svobodová', '+420 234 567 890', 'paní', building1_id, '1/2', 800),
    ('petr.dvorak@email.cz', 'Petr Dvořák', '+420 345 678 901', 'pan', building1_id, '2/1', 1500),
    ('anna.kratka@email.cz', 'Anna Krátká', '+420 456 789 012', 'paní', building1_id, '2/2', 900),
    ('tomas.velky@email.cz', 'Tomáš Velký', '+420 567 890 123', 'pan', building1_id, '3/1', 1300);

    -- Přidání testovacích členů pro druhý dům  
    INSERT INTO members (email, name, phone, greeting, building_id, unitNumber, voteWeight) VALUES
    ('karel.novotny@email.cz', 'Karel Novotný', '+420 678 901 234', 'pan', building2_id, '1', 1000),
    ('eva.hroza@email.cz', 'Eva Hroza', '+420 789 012 345', 'paní', building2_id, '2', 1000),
    ('milan.krejci@email.cz', 'Milan Krejčí', '+420 890 123 456', 'pan', building2_id, '3', 1200);

    -- Přidání ukázkového hlasování
    INSERT INTO votes (building_id, title, description, start_date, end_date, is_active, created_by) VALUES
    (building1_id, 
     'Rekonstrukce výtahu', 
     'Hlasování o schválení rekonstrukce výtahu v hodnotě 180 000 Kč. Práce by měly začít v březnu 2025.', 
     NOW(), 
     NOW() + INTERVAL '7 days',
     true,
     'Jan Novák - předseda');

    -- Získání ID hlasování a přidání možností
    INSERT INTO vote_options (vote_id, option_text, option_order)
    SELECT v.id, unnest(ARRAY['Souhlasím s rekonstrukcí', 'Nesouhlasím', 'Zdržuji se hlasování']), unnest(ARRAY[1, 2, 3])
    FROM votes v WHERE v.title = 'Rekonstrukce výtahu';

END $$;

-- Přidání základních email šablon (pokud neexistují)
INSERT INTO email_templates (name, subject, body, category) VALUES
('Pozvánka na hlasování', 
 'Pozvánka na hlasování: {{vote_title}}',
 'Vážená/ý {{greeting}} {{member_name}},

svoláváme Vás na hlasování s názvem "{{vote_title}}".

Popis hlasování:
{{vote_description}}

Termín hlasování: od {{vote_start}} do {{vote_end}}

Pro hlasování použijte odkaz níže nebo se přihlaste do systému na webu.

S pozdravem,
{{organization_name}}
{{organization_address}}',
 'Hlasování'),

('Výsledky hlasování',
 'Výsledky hlasování: {{vote_title}}', 
 'Vážená/ý {{greeting}} {{member_name}},

hlasování "{{vote_title}}" bylo ukončeno.

Výsledky:
{{vote_results}}

Celkové podrobnosti najdete v aplikaci.

Děkujeme za Vaši účast v hlasování.

S pozdravem,
{{organization_name}}',
 'Hlasování'),

('Připomenutí hlasování',
 'Připomenutí: {{vote_title}} - ještě můžete hlasovat',
 'Vážená/ý {{greeting}} {{member_name}},

připomínáme Vám, že stále probíhá hlasování "{{vote_title}}".

Vaše hlasování jsme zatím nezaregistrovali.

Hlasování bude ukončeno: {{vote_end}}

Pro hlasování se přihlaste do systému.

S pozdravem,
{{organization_name}}',
 'Připomínky');

-- Přidání rozšířených globálních proměnných
INSERT INTO variables (key, description, type, value) VALUES
('email_signature', 'Podpis v emailech', 'global', 'Společenství vlastníků'),
('website_url', 'URL webových stránek', 'global', 'https://www.example.cz'),
('phone_contact', 'Kontaktní telefon', 'global', '+420 123 456 789'),
('office_hours', 'Úřední hodiny', 'global', 'Po-Pá: 9:00-17:00'),
('bank_account', 'Číslo účtu', 'global', '123456789/0100'),
('voting_reminder_days', 'Dny před upozorněním na hlasování', 'global', '2'),
('default_vote_duration', 'Výchozí délka hlasování (dny)', 'global', '7')
ON CONFLICT (key) DO NOTHING;

COMMIT;

-- Informativní dotaz pro kontrolu dat
SELECT 
    'Úspěšně vytvořeno:' as status,
    (SELECT COUNT(*) FROM buildings) as budovy,
    (SELECT COUNT(*) FROM members) as clenove, 
    (SELECT COUNT(*) FROM variables) as promenne,
    (SELECT COUNT(*) FROM email_templates) as sablony,
    (SELECT COUNT(*) FROM votes) as hlasovani;
