# 🧪 TEST PŘIDÁVÁNÍ V APLIKACI

Tento průvodce vám ukáže, jak testovat všechny funkce přidávání v aplikaci.

## 🏢 TEST PŘIDÁNÍ BUDOVY

1. **Otevřete aplikaci** na http://localhost:5176
2. **Přejděte na záložku "Administrace"** (ikona ozubených kol)
3. **Klikněte na "Budovy"** 
4. **Klikněte "Přidat Budovu"**
5. **Vyplňte název** (např. "Testovací dům 123")
6. **Vyplňte data budovy** (adresa, město, atd.)
7. **Klikněte "Uložit"**

**Očekávaný výsledek**: ✅ Budova se přidá do seznamu a zobrazí se zpráva o úspěchu

## 👥 TEST PŘIDÁNÍ ČLENA

1. **Vyberte dům** v dropdown menu nahoře
2. **Přejděte na záložku "Správa členů"** (ikona lidí)
3. **Klikněte "Přidat člena"**
4. **Vyplňte údaje**:
   - Jméno: "Jan Testovací"
   - Email: "jan.test@example.com"
   - Jednotka: "1/1"
   - Váha hlasu: 1000
5. **Klikněte "Uložit"**

**Očekávaný výsledek**: ✅ Člen se přidá do seznamu pro vybraný dům

## ⚙️ TEST PŘIDÁNÍ PROMĚNNÉ

1. **V Administraci přejděte na "Proměnné"**
2. **Klikněte "Přidat proměnnou"**
3. **Vyplňte údaje**:
   - Klíč: "test_variable"
   - Popis: "Testovací proměnná"
   - Typ: "global"
   - Hodnota: "test hodnota"
4. **Klikněte "Uložit"**

**Očekávaný výsledek**: ✅ Proměnná se přidá do seznamu

## 📧 TEST PŘIDÁNÍ EMAIL ŠABLONY

1. **V Administraci přejděte na "Šablony"**
2. **Klikněte "Přidat šablonu"**
3. **Vyplňte údaje**:
   - Název: "Testovací šablona"
   - Předmět: "Test: {{vote_title}}"
   - Obsah: "Dobrý den, toto je test."
   - Kategorie: "Test"
4. **Klikněte "Uložit"**

**Očekávaný výsledek**: ✅ Šablona se přidá do seznamu

## 🗳️ TEST PŘIDÁNÍ HLASOVÁNÍ

1. **Přejděte na záložku "Hlasování"**
2. **Klikněte "Nové hlasování"**
3. **Vyplňte údaje**:
   - Název: "Testovací hlasování"
   - Popis: "Testování funkčnosti"
   - Možnosti: "Ano", "Ne", "Zdržuji se"
   - Doba trvání: 7 dní
4. **Klikněte "Vytvořit hlasování"**

**Očekávaný výsledek**: ✅ Hlasování se vytvoří a zobrazí

## 📊 OVĚŘENÍ DAT

Všechna data se ukládají do:
- **S Supabase**: Do databáze v cloudu
- **Bez Supabase**: Do localStorage (mock data)

### Kontrola mock dat:
1. Otevřete Developer Tools (F12)
2. Jděte do Application → Local Storage
3. Najděte klíče začínající na název aplikace

### Kontrola Supabase dat:
1. Jděte do Supabase dashboardu
2. Database → Table editor
3. Prohlédněte si tabulky: buildings, members, variables, atd.

## ❌ MOŽNÉ PROBLÉMY

### "Nelze přidat budovu/člena/atd."
- Zkontrolujte konzoli prohlížeče (F12)
- Možná chybí povinná pole
- Nebo je problém s připojením k databázi

### "Formulář se neotevře"
- Refresh stránku (Ctrl+F5)
- Zkontrolujte, že běží dev server

### "Data se neuloží"
- S mock daty: Kontrola localStorage
- S Supabase: Kontrola .env konfigurace

## 🎯 VÝSLEDEK TESTU

Po dokončení všech testů byste měli mít:
- ✅ 1 novou budovu
- ✅ 1 nového člena
- ✅ 1 novou proměnnou  
- ✅ 1 novou email šablonu
- ✅ 1 nové hlasování

**Pokud vše funguje → aplikace je připravena k použití! 🚀**
