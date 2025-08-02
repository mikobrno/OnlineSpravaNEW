-- PŘIDÁNÍ TESTOVACÍCH BUDOV DO DATABÁZE
INSERT INTO buildings (name, data) VALUES 
('BD Slančíci 45', '{"adresa": "Slančíci 45, Praha", "ico": "12345678", "dic": "CZ12345678"}'),
('Zborovská 2', '{"adresa": "Zborovská 2, Praha", "ico": "87654321", "dic": "CZ87654321"}'),
('Testovací budova', '{"adresa": "Test 123, Praha", "ico": "11111111", "dic": "CZ11111111"}');

-- PŘIDÁNÍ TESTOVACÍCH PROMĚNNÝCH
INSERT INTO variables (key, description, type, value) VALUES 
('spolecnost', 'Název společnosti', 'global', 'Online Hlasování s.r.o.'),
('web', 'Webová stránka', 'global', 'www.onlinehlasovani.cz'),
('telefon', 'Kontaktní telefon', 'global', '+420 123 456 789'),
('email', 'Kontaktní email', 'global', 'info@onlinehlasovani.cz');

-- PŘIDÁNÍ TESTOVACÍCH ŠABLON
INSERT INTO email_templates (name, subject, body, category) VALUES 
('Pozvánka na hlasování', 'Pozvánka na hlasování - {{nazev_hlasovani}}', 
'Vážení vlastníci,

oznamujeme Vám, že bylo vyhlášeno nové hlasování na téma: {{nazev_hlasovani}}

Popis: {{popis_hlasovani}}

Hlasování probíhá od {{datum_od}} do {{datum_do}}.

Pro hlasování použijte následující odkaz: {{odkaz_hlasovani}}

S pozdravem,
{{spolecnost}}', 'Hlasování'),

('Výsledky hlasování', 'Výsledky hlasování - {{nazev_hlasovani}}', 
'Vážení vlastníci,

hlasování na téma "{{nazev_hlasovani}}" bylo ukončeno.

Výsledky hlasování:
{{vysledky_hlasovani}}

Celkový počet hlasů: {{pocet_hlasu}}

S pozdravem,
{{spolecnost}}', 'Hlasování');
