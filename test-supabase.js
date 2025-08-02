// Quick test pro ověření Supabase připojení
console.log('🔍 SUPABASE ENV TEST:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'NASTAVENO ✅' : 'CHYBÍ ❌');

import { supabase } from './lib/supabaseClient';

// Test připojení
async function testSupabaseConnection() {
  try {
    console.log('🧪 Testuji Supabase připojení...');
    
    // Test základního dotazu
    const { data, error } = await supabase
      .from('buildings')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase chyba:', error.message);
      return false;
    }
    
    console.log('✅ Supabase připojení ÚSPĚŠNÉ!');
    return true;
  } catch (err) {
    console.error('❌ Neočekávaná chyba:', err);
    return false;
  }
}

// Spustit test
testSupabaseConnection();
