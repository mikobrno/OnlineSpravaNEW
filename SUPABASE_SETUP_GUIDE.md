# SUPABASE SETUP GUIDE - Průvodce nastavením Supabase

Tento průvodce vás provede nastavením Supabase databáze pro aplikaci OnlineSpravaNEW.

## 🚀 KROK 1: Vytvoření Supabase projektu

1. Jděte na [https://supabase.com](https://supabase.com)
2. Přihlaste se nebo si vytvořte účet
3. Klikněte na "New Project"
4. Vyberte organizaci a vyplňte:
   - **Project Name**: OnlineSpravaNEW
   - **Database Password**: Vytvořte si silné heslo a zapište si ho
   - **Region**: Europe (Central) - pro nejlepší výkon
5. Klikněte "Create new project"
6. Čekejte cca 2 minuty na vytvoření projektu

## 🔧 KROK 2: Získání přístupových údajů

Po vytvoření projektu:

1. V Supabase dashboardu jděte do **Settings** → **API**
2. Najděte a zkopírujte:
   - **Project URL** (začíná na `https://`)
   - **anon public** API key (dlouhý řetězec znaků)

## 📝 KROK 3: Konfigurace aplikace

1. Otevřete soubor `.env` v root složce projektu
2. Nahraďte prázdné hodnoty vašimi údaji:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🗄️ KROK 4: Vytvoření databázového schématu

1. V Supabase dashboardu jděte do **SQL Editor**
2. Zkopírujte obsah souboru `SUPABASE_FINAL.sql` z projektu
3. Vložte ho do SQL editoru a klikněte **Run**

### Nebo spusťte ručně tyto SQL příkazy:

```sql
-- [OBSAH SOUBORU SUPABASE_FINAL.sql]
```

## 🌱 KROK 5: Přidání testovacích dat

Po vytvoření schématu můžete přidat testovací data spuštěním:

```sql
-- Přidání testovacího domu
INSERT INTO buildings (name, data) VALUES 
('Testovací dům', '{"address": "Testovací 123", "city": "Praha"}');

-- Přidání základních proměnných
INSERT INTO variables (key, description, type, value) VALUES 
('organization_name', 'Název organizace', 'global', 'Společenství vlastníků'),
('organization_address', 'Adresa organizace', 'global', 'Testovací 123, Praha'),
('default_quorum', 'Výchozí kvórum', 'global', '50');

-- Přidání email šablony
INSERT INTO email_templates (name, subject, body, category) VALUES 
('Základní hlasování', 'Nové hlasování: {{vote_title}}', 
'Vážení vlastníci, bylo vyhlášeno nové hlasování. Více informací najdete v aplikaci.', 
'Hlasování');
```

## ✅ KROK 6: Testování připojení

1. Uložte změny v `.env`
2. Restartujte development server:
   ```bash
   npm run dev
   ```
3. Otevřete aplikaci v prohlížeči
4. Zkontrolujte konzoli prohlížeče - měli byste vidět zprávy o úspěšném načítání dat z Supabase

## 🔒 BEZPEČNOSTNÍ POZNÁMKY

- Soubor `.env` je automaticky v `.gitignore` a nebude commitnut do gitu
- **NIKDY** nesdílejte vaše Supabase credentials veřejně
- Anon key je bezpečný pro frontend použití
- RLS (Row Level Security) je zapnuté pro všechny tabulky

## 🆘 ŘEŠENÍ PROBLÉMŮ

### Chyba: "Invalid API key"
- Zkontrolujte, že jste správně zkopírovali anon key z Supabase
- Ujistěte se, že `.env` soubor je v root složce projektu

### Chyba: "table does not exist"
- Spusťte `SUPABASE_FINAL.sql` v SQL editoru
- Zkontrolujte, že všechny tabulky byly vytvořeny

### Data se nenačítají
- Otevřete konzoli prohlížeče (F12)
- Hledejte chybové zprávy
- Zkontrolujte Supabase dashboard → Logs → API

## 📊 STRUKTURA DATABÁZE

Aplikace používá následující tabulky:

- **buildings** - Správa budov/domů
- **members** - Členové společenství
- **variables** - Konfigurace a proměnné
- **email_templates** - Šablony pro emaily
- **votes** - Hlasování
- **vote_options** - Možnosti hlasování
- **cast_votes** - Odevzdané hlasy
- **emails** - Historie odeslaných emailů

## 🔄 MIGRACE Z MOCK DAT

Aplikace automaticky detekuje, zda je Supabase správně nakonfigurána:
- ✅ **S Supabase**: Načítá data z databáze
- ❌ **Bez Supabase**: Používá mock data pro development

Po dokončení nastavení bude aplikace plně funkční s databázovým úložištěm!
