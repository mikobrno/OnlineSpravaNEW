-- Bezpečná aktualizace tabulky votes
-- Spusťte tento SQL v Supabase SQL editoru

-- Nejprve zkontrolujme, jestli tabulka votes existuje
DO $$
BEGIN
    -- Pokud tabulka votes neexistuje, vytvoříme ji
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'votes') THEN
        CREATE TABLE votes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            start_date TIMESTAMP WITH TIME ZONE NOT NULL,
            end_date TIMESTAMP WITH TIME ZONE NOT NULL,
            building_id UUID REFERENCES buildings(id) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_by UUID REFERENCES users(id),
            type VARCHAR(50) DEFAULT 'simple',
            days_duration INTEGER,
            custom_quorum_participation INTEGER,
            custom_quorum_approval INTEGER,
            email_template UUID REFERENCES email_templates(id),
            custom_email_subject VARCHAR(255),
            custom_email_body TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabulka votes byla vytvořena';
    ELSE
        RAISE NOTICE 'Tabulka votes již existuje';
    END IF;
END $$;

-- Nyní bezpečně přidáme chybějící sloupce
DO $$
BEGIN
    -- Zkontrolovat a přidat start_date (pokud má jiný název)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'start_date') THEN
        -- Možná má jiný název, zkusíme startdate nebo startDate
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'startdate') THEN
            ALTER TABLE votes RENAME COLUMN startdate TO start_date;
            RAISE NOTICE 'Sloupec startdate přejmenován na start_date';
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'votes' AND column_name = 'startDate') THEN
            ALTER TABLE votes RENAME COLUMN "startDate" TO start_date;
            RAISE NOTICE 'Sloupec startDate přejmenován na start_date';
        ELSE
            ALTER TABLE votes ADD COLUMN start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Sloupec start_date přidán';
        END IF;
    END IF;

    -- Zkontrolovat a přidat end_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'end_date') THEN
        -- Možná má jiný název
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'enddate') THEN
            ALTER TABLE votes RENAME COLUMN enddate TO end_date;
            RAISE NOTICE 'Sloupec enddate přejmenován na end_date';
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'votes' AND column_name = 'endDate') THEN
            ALTER TABLE votes RENAME COLUMN "endDate" TO end_date;
            RAISE NOTICE 'Sloupec endDate přejmenován na end_date';
        ELSE
            ALTER TABLE votes ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Sloupec end_date přidán';
        END IF;
    END IF;
    
    -- Zkontrolovat a přidat building_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'building_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'buildingid') THEN
            ALTER TABLE votes RENAME COLUMN buildingid TO building_id;
            RAISE NOTICE 'Sloupec buildingid přejmenován na building_id';
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'votes' AND column_name = 'buildingId') THEN
            ALTER TABLE votes RENAME COLUMN "buildingId" TO building_id;
            RAISE NOTICE 'Sloupec buildingId přejmenován na building_id';
        ELSE
            ALTER TABLE votes ADD COLUMN building_id UUID REFERENCES buildings(id);
            RAISE NOTICE 'Sloupec building_id přidán';
        END IF;
    END IF;
    
    -- Přidat ostatní sloupce
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'type') THEN
        ALTER TABLE votes ADD COLUMN type VARCHAR(50) DEFAULT 'simple';
        RAISE NOTICE 'Sloupec type přidán';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'days_duration') THEN
        ALTER TABLE votes ADD COLUMN days_duration INTEGER;
        RAISE NOTICE 'Sloupec days_duration přidán';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'custom_quorum_participation') THEN
        ALTER TABLE votes ADD COLUMN custom_quorum_participation INTEGER;
        RAISE NOTICE 'Sloupec custom_quorum_participation přidán';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'custom_quorum_approval') THEN
        ALTER TABLE votes ADD COLUMN custom_quorum_approval INTEGER;
        RAISE NOTICE 'Sloupec custom_quorum_approval přidán';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'email_template') THEN
        ALTER TABLE votes ADD COLUMN email_template UUID REFERENCES email_templates(id);
        RAISE NOTICE 'Sloupec email_template přidán';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'custom_email_subject') THEN
        ALTER TABLE votes ADD COLUMN custom_email_subject VARCHAR(255);
        RAISE NOTICE 'Sloupec custom_email_subject přidán';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'custom_email_body') THEN
        ALTER TABLE votes ADD COLUMN custom_email_body TEXT;
        RAISE NOTICE 'Sloupec custom_email_body přidán';
    END IF;
    
END $$;

-- Nyní bezpečně aktualizujeme existující záznamy
DO $$
BEGIN
    -- Aktualizovat end_date pokud je NULL a start_date existuje
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'votes' AND column_name = 'start_date') 
       AND EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'votes' AND column_name = 'end_date') THEN
        UPDATE votes 
        SET end_date = start_date + INTERVAL '7 days'
        WHERE end_date IS NULL AND start_date IS NOT NULL;
        RAISE NOTICE 'End_date aktualizováno pro existující záznamy';
    END IF;

    -- Aktualizovat building_id pokud je NULL a existují budovy
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'votes' AND column_name = 'building_id') 
       AND EXISTS (SELECT 1 FROM buildings) THEN
        UPDATE votes 
        SET building_id = (SELECT id FROM buildings LIMIT 1)
        WHERE building_id IS NULL;
        RAISE NOTICE 'Building_id aktualizováno pro existující záznamy';
    END IF;
END $$;
