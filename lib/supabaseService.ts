import { supabase } from './supabaseClient';
import { Member, Building, Variable, EmailTemplate, Vote, VoteOption, CastVote, EmailRecord, VoteForCreation } from '../types';

// === HLASOVÁNÍ ===
export const voteService = {
  // Získání všech hlasování pro budovu
  async getAllByBuilding(buildingId: string): Promise<Vote[]> {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Chyba při načítání hlasování:', error);
      throw error;
    }
    
    return (data || []).map(this.mapFromDatabase);
  },

  // Získání aktivních hlasování pro budovu
  async getActiveByBuilding(buildingId: string): Promise<Vote[]> {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('building_id', buildingId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Chyba při načítání aktivních hlasování:', error);
      throw error;
    }
    
    return (data || []).map(this.mapFromDatabase);
  },

  // Získání konkrétního hlasování
  async getById(id: string): Promise<Vote | null> {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Chyba při načítání hlasování:', error);
      throw error;
    }
    
    return data ? this.mapFromDatabase(data) : null;
  },

  // Vytvoření nového hlasování s možnostmi
  async create(vote: VoteForCreation): Promise<Vote> {
    // Vytvoření hlasování
    const { data: voteData, error: voteError } = await supabase
      .from('votes')
      .insert([this.mapToDatabase(vote)])
      .select()
      .single();

    if (voteError) {
      console.error('Chyba při vytváření hlasování:', voteError);
      throw voteError;
    }

    // Vytvoření možností hlasování
    const optionsData = vote.options.map((option, index) => ({
      vote_id: voteData.id,
      option_text: option,
      option_order: index + 1
    }));

    const { error: optionsError } = await supabase
      .from('vote_options')
      .insert(optionsData);

    if (optionsError) {
      console.error('Chyba při vytváření možností hlasování:', optionsError);
      throw optionsError;
    }

    return this.mapFromDatabase(voteData);
  },

  // Aktualizace hlasování
  async update(id: string, updates: Partial<Vote>): Promise<Vote> {
    const dbUpdates = this.mapToDatabase(updates);
    
    const { data, error } = await supabase
      .from('votes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Chyba při aktualizaci hlasování:', error);
      throw error;
    }
    
    return this.mapFromDatabase(data);
  },

  // Smazání hlasování
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Chyba při mazání hlasování:', error);
      throw error;
    }
  },

  // Mapování z databáze
  mapFromDatabase(dbVote: any): Vote {
    return {
      id: dbVote.id,
      buildingId: dbVote.building_id,
      title: dbVote.title,
      description: dbVote.description,
      startDate: dbVote.start_date,
      endDate: dbVote.end_date,
      isActive: dbVote.is_active,
      createdBy: dbVote.created_by,
      createdAt: dbVote.created_at,
      updatedAt: dbVote.updated_at,
      // Nová pole
      type: dbVote.type,
      daysDuration: dbVote.days_duration,
      customQuorumParticipation: dbVote.custom_quorum_participation,
      customQuorumApproval: dbVote.custom_quorum_approval,
      emailTemplate: dbVote.email_template,
      customEmailSubject: dbVote.custom_email_subject,
      customEmailBody: dbVote.custom_email_body
    };
  },

  // Mapování do databáze
  mapToDatabase(vote: Partial<Vote | VoteForCreation>): any {
    const dbVote: any = {};
    if ('buildingId' in vote && vote.buildingId !== undefined) dbVote.building_id = vote.buildingId;
    if (vote.title !== undefined) dbVote.title = vote.title;
    if (vote.description !== undefined) dbVote.description = vote.description || null;
    if ('startDate' in vote && vote.startDate !== undefined) dbVote.start_date = vote.startDate;
    if ('endDate' in vote && vote.endDate !== undefined) dbVote.end_date = vote.endDate;
    if ('isActive' in vote && vote.isActive !== undefined) dbVote.is_active = vote.isActive;
    if ('createdBy' in vote && vote.createdBy !== undefined) dbVote.created_by = vote.createdBy || null;
    
    // Nová pole pro pokročilé funkce
    if ('type' in vote && vote.type !== undefined) dbVote.type = vote.type;
    if ('daysDuration' in vote && vote.daysDuration !== undefined) dbVote.days_duration = vote.daysDuration;
    if ('customQuorumParticipation' in vote && vote.customQuorumParticipation !== undefined) dbVote.custom_quorum_participation = vote.customQuorumParticipation;
    if ('customQuorumApproval' in vote && vote.customQuorumApproval !== undefined) dbVote.custom_quorum_approval = vote.customQuorumApproval;
    if ('emailTemplate' in vote && vote.emailTemplate !== undefined) dbVote.email_template = vote.emailTemplate;
    if ('customEmailSubject' in vote && vote.customEmailSubject !== undefined) dbVote.custom_email_subject = vote.customEmailSubject;
    if ('customEmailBody' in vote && vote.customEmailBody !== undefined) dbVote.custom_email_body = vote.customEmailBody;
    
    return dbVote;
  }
};

// === MOŽNOSTI HLASOVÁNÍ ===
export const voteOptionService = {
  // Získání možností pro hlasování
  async getByVoteId(voteId: string): Promise<VoteOption[]> {
    const { data, error } = await supabase
      .from('vote_options')
      .select('*')
      .eq('vote_id', voteId)
      .order('option_order');
    
    if (error) {
      console.error('Chyba při načítání možností hlasování:', error);
      throw error;
    }
    
    return (data || []).map(this.mapFromDatabase);
  },

  // Mapování z databáze
  mapFromDatabase(dbOption: any): VoteOption {
    return {
      id: dbOption.id,
      voteId: dbOption.vote_id,
      optionText: dbOption.option_text,
      optionOrder: dbOption.option_order,
      createdAt: dbOption.created_at
    };
  }
};

// === ODEVZDANÉ HLASY ===
export const castVoteService = {
  // Odevzdání hlasu
  async create(voteId: string, optionId: string, voterEmail: string, voterName?: string, voteWeight: number = 1): Promise<CastVote> {
    const { data, error } = await supabase
      .from('cast_votes')
      .insert([{
        vote_id: voteId,
        option_id: optionId,
        voter_email: voterEmail,
        voter_name: voterName || null,
        vote_weight: voteWeight
      }])
      .select()
      .single();

    if (error) {
      console.error('Chyba při odevzdávání hlasu:', error);
      throw error;
    }

    return this.mapFromDatabase(data);
  },

  // Získání všech hlasů pro hlasování
  async getByVoteId(voteId: string): Promise<CastVote[]> {
    const { data, error } = await supabase
      .from('cast_votes')
      .select('*')
      .eq('vote_id', voteId)
      .order('created_at');
    
    if (error) {
      console.error('Chyba při načítání odevzdaných hlasů:', error);
      throw error;
    }
    
    return (data || []).map(this.mapFromDatabase);
  },

  // Kontrola, zda uživatel již hlasoval
  async hasUserVoted(voteId: string, voterEmail: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('cast_votes')
      .select('id')
      .eq('vote_id', voteId)
      .eq('voter_email', voterEmail)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Chyba při kontrole hlasování:', error);
      throw error;
    }
    
    return !!data;
  },

  // Získání výsledků hlasování
  async getResults(voteId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('cast_votes')
      .select(`
        option_id,
        vote_weight,
        vote_options (
          option_text,
          option_order
        )
      `)
      .eq('vote_id', voteId);

    if (error) {
      console.error('Chyba při načítání výsledků:', error);
      throw error;
    }

    // Seskupení výsledků podle možností
    const results = data.reduce((acc: any, vote: any) => {
      const optionId = vote.option_id;
      if (!acc[optionId]) {
        acc[optionId] = {
          optionId,
          optionText: vote.vote_options.option_text,
          optionOrder: vote.vote_options.option_order,
          count: 0,
          totalWeight: 0
        };
      }
      acc[optionId].count++;
      acc[optionId].totalWeight += vote.vote_weight;
      return acc;
    }, {});

    return Object.values(results).sort((a: any, b: any) => a.optionOrder - b.optionOrder);
  },

  // Mapování z databáze
  mapFromDatabase(dbCastVote: any): CastVote {
    return {
      id: dbCastVote.id,
      voteId: dbCastVote.vote_id,
      optionId: dbCastVote.option_id,
      voterEmail: dbCastVote.voter_email,
      voterName: dbCastVote.voter_name,
      voteWeight: dbCastVote.vote_weight,
      createdAt: dbCastVote.created_at
    };
  }
};

// === HISTORIE EMAILŮ ===
export const emailRecordService = {
  // Uložení odeslaného emailu
  async create(record: Omit<EmailRecord, 'id' | 'createdAt' | 'sentAt'>): Promise<EmailRecord> {
    const { data, error } = await supabase
      .from('emails')
      .insert([{
        vote_id: record.voteId || null,
        building_id: record.buildingId || null,
        recipient_email: record.recipientEmail,
        recipient_name: record.recipientName || null,
        subject: record.subject,
        content: record.content,
        template_used: record.templateUsed || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Chyba při ukládání emailu:', error);
      throw error;
    }

    return this.mapFromDatabase(data);
  },

  // Získání historie emailů pro budovu
  async getByBuildingId(buildingId: string): Promise<EmailRecord[]> {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('building_id', buildingId)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Chyba při načítání historie emailů:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDatabase);
  },

  // Získání historie emailů pro hlasování
  async getByVoteId(voteId: string): Promise<EmailRecord[]> {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('vote_id', voteId)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Chyba při načítání historie emailů pro hlasování:', error);
      throw error;
    }

    return (data || []).map(this.mapFromDatabase);
  },

  // Mapování z databáze
  mapFromDatabase(dbEmail: any): EmailRecord {
    return {
      id: dbEmail.id,
      voteId: dbEmail.vote_id,
      buildingId: dbEmail.building_id,
      recipientEmail: dbEmail.recipient_email,
      recipientName: dbEmail.recipient_name,
      subject: dbEmail.subject,
      content: dbEmail.content,
      templateUsed: dbEmail.template_used,
      sentAt: dbEmail.sent_at,
      createdAt: dbEmail.created_at
    };
  }
};

// === BUDOVY ===
export const buildingService = {
  async getAll(): Promise<Building[]> {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Chyba při načítání budov:', error);
      throw error;
    }
    
    return data || [];
  },

  async getById(id: string): Promise<Building | null> {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Chyba při načítání budovy:', error);
      throw error;
    }
    
    return data;
  },

  async create(building: Omit<Building, 'id' | 'created_at' | 'updated_at'>): Promise<Building> {
    const { data, error } = await supabase
      .from('buildings')
      .insert([building])
      .select()
      .single();
    
    if (error) {
      console.error('Chyba při vytváření budovy:', error);
      throw error;
    }
    
    return data;
  },

  async update(id: string, updates: Partial<Omit<Building, 'id' | 'created_at' | 'updated_at'>>): Promise<Building> {
    const { data, error } = await supabase
      .from('buildings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Chyba při aktualizaci budovy:', error);
      throw error;
    }
    
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('buildings')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Chyba při mazání budovy:', error);
      throw error;
    }
  }
};

// === PROMĚNNÉ ===
export const variableService = {
  async getAll(): Promise<Variable[]> {
    const { data, error } = await supabase
      .from('variables')
      .select('*')
      .order('type', { ascending: true })
      .order('description', { ascending: true });
    
    if (error) {
      console.error('Chyba při načítání proměnných:', error);
      throw error;
    }
    
    return data || [];
  },

  async getByType(type: 'global' | 'building'): Promise<Variable[]> {
    const { data, error } = await supabase
      .from('variables')
      .select('*')
      .eq('type', type)
      .order('description');
    
    if (error) {
      console.error('Chyba při načítání proměnných podle typu:', error);
      throw error;
    }
    
    return data || [];
  },

  async getByKey(key: string): Promise<Variable | null> {
    const { data, error } = await supabase
      .from('variables')
      .select('*')
      .eq('key', key)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Chyba při načítání proměnné:', error);
      throw error;
    }
    
    return data;
  },

  async create(variable: Omit<Variable, 'id' | 'created_at' | 'updated_at'>): Promise<Variable> {
    const { data, error } = await supabase
      .from('variables')
      .insert([variable])
      .select()
      .single();
    
    if (error) {
      console.error('Chyba při vytváření proměnné:', error);
      throw error;
    }
    
    return data;
  },

  async update(id: string, updates: Partial<Omit<Variable, 'id' | 'created_at' | 'updated_at'>>): Promise<Variable> {
    const { data, error } = await supabase
      .from('variables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Chyba při aktualizaci proměnné:', error);
      throw error;
    }
    
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('variables')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Chyba při mazání proměnné:', error);
      throw error;
    }
  }
};

// === EMAIL ŠABLONY ===
export const emailTemplateService = {
  async getAll(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Chyba při načítání email šablon:', error);
      throw error;
    }
    
    return data || [];
  },

  async getByCategory(category: string): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('category', category)
      .order('name');
    
    if (error) {
      console.error('Chyba při načítání email šablon podle kategorie:', error);
      throw error;
    }
    
    return data || [];
  },

  async getById(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Chyba při načítání email šablony:', error);
      throw error;
    }
    
    return data;
  },

  async create(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert([template])
      .select()
      .single();
    
    if (error) {
      console.error('Chyba při vytváření email šablony:', error);
      throw error;
    }
    
    return data;
  },

  async update(id: string, updates: Partial<Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Chyba při aktualizaci email šablony:', error);
      throw error;
    }
    
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Chyba při mazání email šablony:', error);
      throw error;
    }
  }
};

// === ČLENOVÉ ===
export const memberService = {
  async getAll(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('unitNumber', { ascending: true });
    
    if (error) {
      console.error('Chyba při načítání členů:', error);
      throw error;
    }
    
    return (data || []).map(this.mapFromDatabase);
  },

  async getByBuilding(buildingId: string): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('buildingId', buildingId)
      .order('unitNumber', { ascending: true });
    
    if (error) {
      console.error('Chyba při načítání členů podle budovy:', error);
      throw error;
    }
    
    return (data || []).map(this.mapFromDatabase);
  },

  async getById(id: string): Promise<Member | null> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Chyba při načítání člena:', error);
      throw error;
    }
    
    return data ? this.mapFromDatabase(data) : null;
  },

  async create(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Promise<Member> {
    const dbMember = this.mapToDatabase(member);
    
    const { data, error } = await supabase
      .from('members')
      .insert([dbMember])
      .select()
      .single();
    
    if (error) {
      console.error('Chyba při vytváření člena:', error);
      throw error;
    }
    
    return this.mapFromDatabase(data);
  },

  async update(id: string, updates: Partial<Omit<Member, 'id' | 'created_at' | 'updated_at'>>): Promise<Member> {
    const dbUpdates = this.mapToDatabase(updates);
    
    const { data, error } = await supabase
      .from('members')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Chyba při aktualizaci člena:', error);
      throw error;
    }
    
    return this.mapFromDatabase(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Chyba při mazání člena:', error);
      throw error;
    }
  },

  // Mapování z databáze (snake_case v DB) na aplikaci (camelCase)
  mapFromDatabase(dbMember: any): Member {
    return {
      id: dbMember.id,
      name: dbMember.name,
      email: dbMember.email,
      phone: dbMember.phone,
      unitNumber: dbMember.unitNumber, // Databáze má unitNumber (camelCase)
      voteWeight: dbMember.voteWeight, // Databáze má voteWeight (camelCase)
      buildingId: dbMember.buildingId, // Databáze má buildingId (camelCase)
      representedByMemberId: dbMember.representedByMemberId, // Databáze má representedByMemberId (camelCase)
      greeting: dbMember.greeting
    } as Member;
  },

  // Mapování z aplikace (camelCase) na databázi (také camelCase)
  mapToDatabase(member: Partial<Member>): any {
    const dbMember: any = {};
    if (member.name !== undefined) dbMember.name = member.name;
    if (member.email !== undefined) dbMember.email = member.email;
    if (member.phone !== undefined) dbMember.phone = member.phone || null;
    if (member.unitNumber !== undefined) dbMember.unitNumber = member.unitNumber; // Databáze má unitNumber
    if (member.voteWeight !== undefined) dbMember.voteWeight = member.voteWeight; // Databáze má voteWeight
    if (member.greeting !== undefined) dbMember.greeting = member.greeting || null;
    
    // Pro buildingId: prázdný řetězec převedeme na null
    if (member.buildingId !== undefined) {
      dbMember.buildingId = member.buildingId || null;
    }
    
    // Pro representedByMemberId: prázdný řetězec převedeme na null
    if (member.representedByMemberId !== undefined) {
      dbMember.representedByMemberId = member.representedByMemberId || null;
    }

    return dbMember;
  }
};

// === UTILITY FUNKCE ===
export const utilityService = {
  // Náhrada proměnných v textu na základě dat z databáze
  async replaceVariables(text: string, buildingId?: string): Promise<string> {
    let result = text;
    
    try {
      // Načtení globálních proměnných
      const globalVars = await variableService.getByType('global');
      
      // Nahrazení globálních proměnných
      globalVars.forEach(variable => {
        if (variable.value) {
          const regex = new RegExp(`{{${variable.key}}}`, 'g');
          result = result.replace(regex, variable.value);
        }
      });
      
      // Pokud je specifikována budova, načtení a nahrazení proměnných budovy
      if (buildingId) {
        const building = await buildingService.getById(buildingId);
        if (building && building.data) {
          Object.entries(building.data).forEach(([key, value]) => {
            if (value) {
              const regex = new RegExp(`{{${key}}}`, 'g');
              result = result.replace(regex, value);
            }
          });
        }
      }
    } catch (error) {
      console.error('Chyba při nahrazování proměnných:', error);
    }
    
    return result;
  },

  // Generování náhodného ID
  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
};
