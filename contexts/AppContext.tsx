import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  AppContextType, 
  EmailTemplate, 
  Variable, 
  User, 
  Member, 
  Vote, 
  VoteOption, 
  CastVote, 
  EmailRecord, 
  UserVoteSubmission, 
  VoteForCreation, 
  Building 
} from '../types';
import { MOCK_USERS, MOCK_USER_VOTES } from '../data/mockData';
import { 
  buildingService, 
  variableService, 
  emailTemplateService, 
  memberService,
  voteService,
  voteOptionService,
  castVoteService,
  emailRecordService
} from '../lib/supabaseService';
import { supabaseManager } from '../lib/supabaseManager';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Building selection state
  const [selectedBuildingId, setSelectedBuildingId] = useLocalStorage<string | null>('selectedBuildingId', null);
  
  // Data Management State - SUPABASE
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
  // Voting System State - KOMPLETNÍ DATABÁZOVÁ IMPLEMENTACE
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voteOptions, setVoteOptions] = useState<Record<string, VoteOption[]>>({});
  const [castVotes, setCastVotes] = useState<Record<string, CastVote[]>>({});
  const [emailRecords, setEmailRecords] = useState<EmailRecord[]>([]);
  
  // Legacy support for existing components
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [userVotes, setUserVotes] = useState<UserVoteSubmission[]>([]);

  // Načtení dat z Supabase při inicializaci a změně vybraného domu
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 Kontroluji Supabase připojení...');
        
        // Kontrola a inicializace Supabase připojení
        const healthCheck = await supabaseManager.checkHealth();
        console.log('🔍 Supabase stav:', supabaseManager.getConnectionInfo());
        
        if (!healthCheck.isConnected) {
          console.warn('⚠️ Supabase není připojena, používám mock data');
          setUsers(MOCK_USERS);
          setUserVotes(MOCK_USER_VOTES);
          if (!currentUser || !MOCK_USERS.find(u => u.id === currentUser.id)) {
            setCurrentUser(MOCK_USERS.find(u => u.role === 'admin') || MOCK_USERS[0]);
          }
          return;
        }

        // Inicializace základních dat
        await supabaseManager.initializeBasicData();
        
        console.log('🔄 Načítám data z Supabase...');
        
        // Načtení základních dat z databáze
        const [buildingsData, variablesData, templatesData] = await Promise.all([
          buildingService.getAll(),
          variableService.getAll(),
          emailTemplateService.getAll()
        ]);

        console.log('📊 Načtena základní data:', {
          budovy: buildingsData.length,
          proměnné: variablesData.length,
          šablony: templatesData.length
        });

        // Nastavení základních dat z Supabase
        setBuildings(buildingsData);
        setVariables(variablesData);
        setEmailTemplates(templatesData);
        
        // Načtení dat specifických pro vybraný dům
        if (selectedBuildingId) {
          await loadBuildingSpecificData(selectedBuildingId);
        } else {
          // Pokud není vybrán dům, načti jen prázdná data
          setMembers([]);
          setVotes([]);
          setVoteOptions({});
          setCastVotes({});
          setEmailRecords([]);
        }
        
        // Mock data pro legacy podporu
        setUsers(MOCK_USERS);
        setUserVotes(MOCK_USER_VOTES);

        // Set a default user from mock data if none is set or invalid
        if (!currentUser || !MOCK_USERS.find(u => u.id === currentUser.id)) {
          setCurrentUser(MOCK_USERS.find(u => u.role === 'admin') || MOCK_USERS[0]);
        }
        
        console.log('✅ Všechna data úspěšně načtena');
      } catch (error) {
        console.error('❌ Chyba při načítání dat z Supabase:', error);
        // V případě chyby použijeme pouze mock data
        setUsers(MOCK_USERS);
        setUserVotes(MOCK_USER_VOTES);
        if (!currentUser || !MOCK_USERS.find(u => u.id === currentUser.id)) {
          setCurrentUser(MOCK_USERS.find(u => u.role === 'admin') || MOCK_USERS[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedBuildingId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Načtení dat specifických pro dům
  const loadBuildingSpecificData = async (buildingId: string) => {
    try {
      console.log(`🏢 Načítám data pro dům: ${buildingId}`);
      
      const [membersData, votesData, emailRecordsData] = await Promise.all([
        memberService.getByBuilding(buildingId),
        voteService.getAllByBuilding(buildingId),
        emailRecordService.getByBuildingId(buildingId)
      ]);

      setMembers(membersData);
      setVotes(votesData);
      setEmailRecords(emailRecordsData);

      // Načtení možností a hlasů pro každé hlasování
      const voteOptionsMap: Record<string, VoteOption[]> = {};
      const castVotesMap: Record<string, CastVote[]> = {};
      
      for (const vote of votesData) {
        const [options, votes] = await Promise.all([
          voteOptionService.getByVoteId(vote.id),
          castVoteService.getByVoteId(vote.id)
        ]);
        voteOptionsMap[vote.id] = options;
        castVotesMap[vote.id] = votes;
      }
      
      setVoteOptions(voteOptionsMap);
      setCastVotes(castVotesMap);

      console.log(`✅ Data pro dům načtena:`, {
        členové: membersData.length,
        hlasování: votesData.length,
        emaily: emailRecordsData.length
      });
    } catch (error) {
      console.error('❌ Chyba při načítání dat pro dům:', error);
    }
  };

  // === SUPABASE DATA MANAGEMENT FUNCTIONS ===
  
  // --- BUDOVY ---
  const addBuilding = async (building: Omit<Building, 'id'>) => {
    try {
      const newBuilding = await buildingService.create({
        name: building.name,
        data: building.data
      });
      setBuildings(prev => [...prev, newBuilding]);
      console.log('✅ Budova úspěšně přidána:', newBuilding);
    } catch (error) {
      console.error('❌ Chyba při přidávání budovy:', error);
      throw error;
    }
  };

  const updateBuilding = async (building: Building) => {
    try {
      const updatedBuilding = await buildingService.update(building.id, {
        name: building.name,
        data: building.data
      });
      setBuildings(prev => prev.map(b => b.id === building.id ? updatedBuilding : b));
      console.log('✅ Budova úspěšně aktualizována:', updatedBuilding);
    } catch (error) {
      console.error('❌ Chyba při aktualizaci budovy:', error);
      throw error;
    }
  };

  const deleteBuilding = async (id: string) => {
    try {
      await buildingService.delete(id);
      setBuildings(prev => prev.filter(b => b.id !== id));
      // Pokud je smazaná budova aktuálně vybraná, zruš výběr
      if (selectedBuildingId === id) {
        setSelectedBuildingId(null);
      }
      console.log('✅ Budova úspěšně smazána:', id);
    } catch (error) {
      console.error('❌ Chyba při mazání budovy:', error);
      throw error;
    }
  };

  // --- PROMĚNNÉ ---
  const addVariable = async (variable: Omit<Variable, 'id'>) => {
    try {
      const newVariable = await variableService.create(variable);
      setVariables(prev => [...prev, newVariable]);
      console.log('✅ Proměnná úspěšně přidána:', newVariable);
    } catch (error) {
      console.error('❌ Chyba při přidávání proměnné:', error);
      throw error;
    }
  };

  const updateVariable = async (variable: Variable) => {
    try {
      const updatedVariable = await variableService.update(variable.id, {
        key: variable.key,
        description: variable.description,
        type: variable.type,
        value: variable.value
      });
      setVariables(prev => prev.map(v => v.id === variable.id ? updatedVariable : v));
      console.log('✅ Proměnná úspěšně aktualizována:', updatedVariable);
    } catch (error) {
      console.error('❌ Chyba při aktualizaci proměnné:', error);
      throw error;
    }
  };

  const deleteVariable = async (id: string) => {
    try {
      await variableService.delete(id);
      setVariables(prev => prev.filter(v => v.id !== id));
      console.log('✅ Proměnná úspěšně smazána:', id);
    } catch (error) {
      console.error('❌ Chyba při mazání proměnné:', error);
      throw error;
    }
  };

  // --- EMAIL ŠABLONY ---
  const addEmailTemplate = async (template: Omit<EmailTemplate, 'id'>) => {
    try {
      const newTemplate = await emailTemplateService.create(template);
      setEmailTemplates(prev => [...prev, newTemplate]);
      console.log('✅ Email šablona úspěšně přidána:', newTemplate);
    } catch (error) {
      console.error('❌ Chyba při přidávání email šablony:', error);
      throw error;
    }
  };

  const updateEmailTemplate = async (template: EmailTemplate) => {
    try {
      const updatedTemplate = await emailTemplateService.update(template.id, {
        name: template.name,
        subject: template.subject,
        body: template.body,
        category: template.category
      });
      setEmailTemplates(prev => prev.map(t => t.id === template.id ? updatedTemplate : t));
      console.log('✅ Email šablona úspěšně aktualizována:', updatedTemplate);
    } catch (error) {
      console.error('❌ Chyba při aktualizaci email šablony:', error);
      throw error;
    }
  };

  const deleteEmailTemplate = async (id: string) => {
    try {
      await emailTemplateService.delete(id);
      setEmailTemplates(prev => prev.filter(t => t.id !== id));
      console.log('✅ Email šablona úspěšně smazána:', id);
    } catch (error) {
      console.error('❌ Chyba při mazání email šablony:', error);
      throw error;
    }
  };

  // === ČLENOVÉ (FILTROVANÍ PODLE VYBRANÉHO DOMU) ===
  
  const addMember = async (member: Omit<Member, 'id'>) => {
    try {
      // Automaticky přiřaď k vybranému domu
      const memberWithBuilding = {
        ...member,
        buildingId: selectedBuildingId || undefined
      };
      
      const newMember = await memberService.create(memberWithBuilding);
      setMembers(prev => [...prev, newMember]);
      console.log('✅ Člen úspěšně přidán:', newMember);
    } catch (error) {
      console.error('❌ Chyba při přidávání člena:', error);
      throw error;
    }
  };

  const updateMember = async (id: string, updates: Partial<Omit<Member, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const updatedMember = await memberService.update(id, updates);
      setMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
      console.log('✅ Člen úspěšně aktualizován:', updatedMember);
    } catch (error) {
      console.error('❌ Chyba při aktualizaci člena:', error);
      throw error;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await memberService.delete(id);
      setMembers(prev => prev.filter(m => m.id !== id));
      console.log('✅ Člen úspěšně smazán:', id);
    } catch (error) {
      console.error('❌ Chyba při mazání člena:', error);
      throw error;
    }
  };

  const addMultipleMembers = async (newMembers: Omit<Member, 'id'>[]): Promise<number> => {
    try {
      const existingEmails = new Set(members.map(m => m.email));
      const uniqueNewMembers = newMembers.filter(nm => !existingEmails.has(nm.email));

      if (uniqueNewMembers.length === 0) return 0;

      const createdMembers: Member[] = [];
      
      for (const member of uniqueNewMembers) {
        try {
          // Automaticky přiřaď k vybranému domu
          const memberWithBuilding = {
            ...member,
            buildingId: selectedBuildingId || undefined
          };
          
          const newMember = await memberService.create(memberWithBuilding);
          createdMembers.push(newMember);
        } catch (error) {
          console.error(`❌ Chyba při přidávání člena ${member.email}:`, error);
        }
      }

      if (createdMembers.length > 0) {
        setMembers(prev => [...prev, ...createdMembers]);
        console.log(`✅ Úspěšně přidáno ${createdMembers.length} členů`);
      }
      
      return createdMembers.length;
    } catch (error) {
      console.error('❌ Chyba při hromadném přidávání členů:', error);
      throw error;
    }
  };

  // === VOTING SYSTEM FUNCTIONS (DATABÁZOVÉ IMPLEMENTACE) ===
  
  // Vytvoření nového hlasování
  const addVote = async (voteData: VoteForCreation): Promise<Vote> => {
    try {
      if (!selectedBuildingId) {
        throw new Error('Není vybrán žádný dům. Vyberte dům pro vytvoření hlasování.');
      }

      const voteWithBuilding: VoteForCreation = {
        ...voteData,
        buildingId: selectedBuildingId
      };

      const newVote = await voteService.create(voteWithBuilding);
      
      // Načtení možností nového hlasování
      const options = await voteOptionService.getByVoteId(newVote.id);
      
      setVotes(prev => [newVote, ...prev]);
      setVoteOptions(prev => ({ ...prev, [newVote.id]: options }));
      setCastVotes(prev => ({ ...prev, [newVote.id]: [] }));
      
      console.log('✅ Hlasování úspěšně vytvořeno:', newVote);
      return newVote;
    } catch (error) {
      console.error('❌ Chyba při vytváření hlasování:', error);
      throw error;
    }
  };

  // Aktualizace hlasování
  const updateVote = async (id: string, updates: Partial<Vote>): Promise<void> => {
    try {
      const updatedVote = await voteService.update(id, updates);
      setVotes(prev => prev.map(v => v.id === id ? updatedVote : v));
      console.log('✅ Hlasování úspěšně aktualizováno:', updatedVote);
    } catch (error) {
      console.error('❌ Chyba při aktualizaci hlasování:', error);
      throw error;
    }
  };

  // Smazání hlasování
  const deleteVote = async (id: string): Promise<void> => {
    try {
      await voteService.delete(id);
      setVotes(prev => prev.filter(v => v.id !== id));
      setVoteOptions(prev => {
        const newOptions = { ...prev };
        delete newOptions[id];
        return newOptions;
      });
      setCastVotes(prev => {
        const newVotes = { ...prev };
        delete newVotes[id];
        return newVotes;
      });
      console.log('✅ Hlasování úspěšně smazáno:', id);
    } catch (error) {
      console.error('❌ Chyba při mazání hlasování:', error);
      throw error;
    }
  };

  // Odevzdání hlasu
  const castVote = async (voteId: string, optionId: string, voterEmail: string, voterName?: string): Promise<void> => {
    try {
      // Najdi voliče v členech pro získání vote_weight
      const member = members.find(m => m.email === voterEmail);
      const voteWeight = member?.voteWeight || 1;
      
      const newCastVote = await castVoteService.create(voteId, optionId, voterEmail, voterName, voteWeight);
      
      setCastVotes(prev => ({
        ...prev,
        [voteId]: [...(prev[voteId] || []), newCastVote]
      }));
      
      console.log('✅ Hlas úspěšně odevzdán:', newCastVote);
    } catch (error) {
      console.error('❌ Chyba při odevzdávání hlasu:', error);
      throw error;
    }
  };

  // Kontrola, zda uživatel již hlasoval
  const hasUserVoted = async (voteId: string, voterEmail: string): Promise<boolean> => {
    try {
      return await castVoteService.hasUserVoted(voteId, voterEmail);
    } catch (error) {
      console.error('❌ Chyba při kontrole hlasování:', error);
      return false;
    }
  };

  // Získání výsledků hlasování
  const getVoteResults = async (voteId: string): Promise<any[]> => {
    try {
      return await castVoteService.getResults(voteId);
    } catch (error) {
      console.error('❌ Chyba při načítání výsledků:', error);
      return [];
    }
  };

  // Odeslání emailů pro hlasování
  const sendVoteEmails = async (voteId: string, memberIds: string[]): Promise<void> => {
    try {
      if (!selectedBuildingId) {
        throw new Error('Není vybrán žádný dům');
      }

      const vote = votes.find(v => v.id === voteId);
      if (!vote) {
        throw new Error('Hlasování nenalezeno');
      }

      const selectedMembers = members.filter(m => memberIds.includes(m.id));
      
      for (const member of selectedMembers) {
        await emailRecordService.create({
          voteId: voteId,
          buildingId: selectedBuildingId,
          recipientEmail: member.email,
          recipientName: member.name,
          subject: `Pozvánka k hlasování: ${vote.title}`,
          content: `Vážená/ý ${member.greeting || member.name}, jste pozván k účasti v hlasování: ${vote.title}`,
          templateUsed: 'default_vote_invitation'
        });
      }

      // Reload email records
      const updatedEmailRecords = await emailRecordService.getByBuildingId(selectedBuildingId);
      setEmailRecords(updatedEmailRecords);
      
      console.log(`✅ Emaily odeslány ${selectedMembers.length} členům`);
    } catch (error) {
      console.error('❌ Chyba při odesílání emailů:', error);
      throw error;
    }
  };

  // === LEGACY SUPPORT FUNCTIONS ===
  
  const setCurrentUserById = (id: string) => {
    const user = users.find(u => u.id === id) || null;
    setCurrentUser(user);
  };
  
  const submitUserVote = (voteSubmission: UserVoteSubmission) => {
    const hasVoted = userVotes.some(v => v.voteId === voteSubmission.voteId && v.userId === voteSubmission.userId);
    if (hasVoted) throw new Error("V tomto hlasování jste již hlasoval/a.");
    
    const newVoteSubmission = { ...voteSubmission, id: Date.now() };
    setUserVotes(prev => [...prev, newVoteSubmission]);
  };

  // === CONTEXT VALUE ===
  const value: AppContextType = {
    isLoading,
    
    // Building selection
    selectedBuildingId,
    setSelectedBuildingId,
    
    // Data Management
    buildings, addBuilding, updateBuilding, deleteBuilding,
    variables, addVariable, updateVariable, deleteVariable,
    emailTemplates, addEmailTemplate, updateEmailTemplate, deleteEmailTemplate,
    
    // Members (filtered by selected building)
    members, addMember, updateMember, deleteMember, addMultipleMembers,
    
    // Voting System (filtered by selected building)
    votes,
    voteOptions,
    castVotes,
    emailRecords,
    addVote,
    updateVote,
    deleteVote,
    castVote,
    hasUserVoted,
    getVoteResults,
    sendVoteEmails,
    
    // Legacy support
    users,
    currentUser,
    setCurrentUserById,
    userVotes,
    submitUserVote
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
