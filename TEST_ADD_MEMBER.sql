-- TEST PŘIDÁNÍ ČLENA PŘÍMO V DATABÁZI
-- Nejdříve získáme ID budovy "BD Slančíci 45"
SELECT id, name FROM buildings WHERE name = 'BD Slančíci 45';

-- Pak zkusíme přidat testovacího člena (nahraďte building_id skutečným ID)
INSERT INTO members (name, email, phone, unit_number, vote_weight, building_id, greeting) 
VALUES (
    'Test Člen', 
    'test@email.cz', 
    '+420123456789', 
    '15', 
    1, 
    (SELECT id FROM buildings WHERE name = 'BD Slančíci 45' LIMIT 1),
    'Vážený pane'
);
