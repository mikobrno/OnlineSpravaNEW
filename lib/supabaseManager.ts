// Utility pro kontrolu a inicializaci Supabase připojení
import { supabase } from './supabaseClient';

interface SupabaseHealthCheck {
  isConnected: boolean;
  hasValidCredentials: boolean;
  hasSchema: boolean;
  errors: string[];
}

export class SupabaseManager {
  private static instance: SupabaseManager;
  private healthStatus: SupabaseHealthCheck | null = null;

  static getInstance(): SupabaseManager {
    if (!SupabaseManager.instance) {
      SupabaseManager.instance = new SupabaseManager();
    }
    return SupabaseManager.instance;
  }

  async checkHealth(): Promise<SupabaseHealthCheck> {
    const errors: string[] = [];
    let isConnected = false;
    let hasValidCredentials = false;
    let hasSchema = false;

    try {
      // Kontrola prostředních proměnných
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || supabaseUrl.includes('your-project')) {
        errors.push('VITE_SUPABASE_URL není správně nastavena v .env souboru');
      }

      if (!supabaseKey || supabaseKey.includes('your-anon-key')) {
        errors.push('VITE_SUPABASE_ANON_KEY není správně nastavena v .env souboru');
      }

      if (errors.length === 0) {
        hasValidCredentials = true;

        // Test připojení k databázi
        const { error } = await supabase
          .from('buildings')
          .select('count')
          .limit(1);

        if (error) {
          if (error.message.includes('relation "buildings" does not exist')) {
            errors.push('Databázové schéma není vytvořeno. Spusťte SUPABASE_FINAL.sql');
          } else if (error.message.includes('Invalid API key')) {
            errors.push('Neplatný API klíč. Zkontrolujte VITE_SUPABASE_ANON_KEY');
          } else {
            errors.push(`Chyba připojení k databázi: ${error.message}`);
          }
        } else {
          isConnected = true;
          hasSchema = true;
        }
      }
    } catch (error) {
      errors.push(`Neočekávaná chyba: ${error instanceof Error ? error.message : 'Neznámá chyba'}`);
    }

    this.healthStatus = {
      isConnected,
      hasValidCredentials,
      hasSchema,
      errors
    };

    return this.healthStatus;
  }

  async initializeBasicData(): Promise<void> {
    const health = await this.checkHealth();
    
    if (!health.isConnected) {
      throw new Error('Supabase není připojena. Zkontrolujte konfiguraci.');
    }

    try {
      // Kontrola základních dat a jejich vytvoření pokud neexistují
      await this.ensureBasicVariables();
      await this.ensureBasicEmailTemplates();
      console.log('✅ Základní data v Supabase jsou připravena');
    } catch (error) {
      console.error('❌ Chyba při inicializaci základních dat:', error);
      throw error;
    }
  }

  private async ensureBasicVariables(): Promise<void> {
    const { data: existingVars } = await supabase
      .from('variables')
      .select('key');

    const existingKeys = existingVars?.map(v => v.key) || [];

    const basicVariables = [
      {
        key: 'organization_name',
        description: 'Název organizace',
        type: 'global',
        value: 'Společenství vlastníků'
      },
      {
        key: 'organization_address', 
        description: 'Adresa organizace',
        type: 'global',
        value: ''
      },
      {
        key: 'default_quorum_participation',
        description: 'Výchozí kvórum pro účast (%)',
        type: 'global',
        value: '50'
      },
      {
        key: 'default_quorum_approval',
        description: 'Výchozí kvórum pro schválení (%)',
        type: 'global',
        value: '50'
      }
    ];

    const toInsert = basicVariables.filter(v => !existingKeys.includes(v.key));
    
    if (toInsert.length > 0) {
      const { error } = await supabase
        .from('variables')
        .insert(toInsert);
      
      if (error) {
        throw new Error(`Chyba při vytváření základních proměnných: ${error.message}`);
      }
      
      console.log(`✅ Vytvořeno ${toInsert.length} základních proměnných`);
    }
  }

  private async ensureBasicEmailTemplates(): Promise<void> {
    const { data: existingTemplates } = await supabase
      .from('email_templates')
      .select('name');

    const existingNames = existingTemplates?.map(t => t.name) || [];

    const basicTemplates = [
      {
        name: 'Základní hlasování',
        subject: 'Nové hlasování: {{vote_title}}',
        body: `Vážení vlastníci,

bylo vyhlášeno nové hlasování s názvem "{{vote_title}}".

Popis: {{vote_description}}

Hlasování probíhá od {{vote_start}} do {{vote_end}}.

Pro hlasování použijte odkaz v tomto emailu nebo se přihlaste do systému.

S pozdravem,
{{organization_name}}`,
        category: 'Hlasování'
      },
      {
        name: 'Výsledky hlasování',
        subject: 'Výsledky hlasování: {{vote_title}}',
        body: `Vážení vlastníci,

hlasování "{{vote_title}}" bylo ukončeno.

Celkové výsledky najdete v aplikaci nebo na webových stránkách společenství.

Děkujeme za vaši účast.

S pozdravem,
{{organization_name}}`,
        category: 'Hlasování'
      }
    ];

    const toInsert = basicTemplates.filter(t => !existingNames.includes(t.name));
    
    if (toInsert.length > 0) {
      const { error } = await supabase
        .from('email_templates')
        .insert(toInsert);
      
      if (error) {
        throw new Error(`Chyba při vytváření základních šablon: ${error.message}`);
      }
      
      console.log(`✅ Vytvořeno ${toInsert.length} základních email šablon`);
    }
  }

  getHealthStatus(): SupabaseHealthCheck | null {
    return this.healthStatus;
  }

  isReady(): boolean {
    return this.healthStatus?.isConnected === true;
  }

  getConnectionInfo(): string {
    if (!this.healthStatus) {
      return 'Supabase připojení nebylo otestováno';
    }

    if (this.healthStatus.isConnected) {
      return '✅ Supabase je úspěšně připojena a funkční';
    }

    if (this.healthStatus.errors.length > 0) {
      return `❌ Problémy s Supabase:\n${this.healthStatus.errors.join('\n')}`;
    }

    return '⚠️ Supabase připojení má neznámé problémy';
  }
}

// Singleton instance
export const supabaseManager = SupabaseManager.getInstance();
