// --- THEME TYPES ---
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

// --- DATA TYPES ---
export interface Variable {
    id: string;
    key: string;
    description: string;
    type: 'global' | 'building';
    value?: string; // Only for global type
    name?: string; // Add name property for compatibility
}

export interface Building {
  id: string;
  name: string;
  data: Record<string, string>; // Keys correspond to Variable keys of type 'building'
  owner_id?: string; // Add for compatibility with mockData
}

export interface EmailTemplate {
  id:string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

// --- VOTING SYSTEM TYPES - DATABÁZOVÁ STRUKTURA ---
export type UserRole = 'admin' | 'member' | 'observer';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  memberId?: string; // Link to the member details
}

export interface Member {
    id: string;
    name: string;
    email: string;
    phone?: string; // Telefonní číslo pro SMS ověření
    unitNumber: string;
    voteWeight: number;
    buildingId?: string; // ID budovy, ke které člen patří
    representedByMemberId?: string; // ID of the member who represents this member
    greeting?: string; // Individuální oslovení člena (např. "Vážený pane", "Vážená paní")
}

// Nová databázová struktura hlasování
export interface Vote {
    id: string;
    buildingId: string; // Vždy přiřazeno k budově
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
    // Pokročilé funkce
    type?: VoteType;
    daysDuration?: number;
    customQuorumParticipation?: number;
    customQuorumApproval?: number;
    emailTemplate?: string;
    customEmailSubject?: string;
    customEmailBody?: string;
    // Legacy properties for backward compatibility
    status?: VoteStatus;
    questions?: Question[];
    attachments?: { name: string; url: string }[];
    observerEmails?: string[];
    emailLog?: { memberId: string; timestamp: string; }[];
    memberTokens?: Record<string, string>; // { [memberId]: "unique_token" }
    representativeOverrides?: Record<string, string>; // { [representedMemberId]: "representativeMemberId" }
    created_by?: string; // Alternative field name
}

export interface VoteOption {
    id: string;
    voteId: string;
    optionText: string;
    optionOrder: number;
    createdAt: string;
}

export interface CastVote {
    id: string;
    voteId: string;
    optionId: string;
    voterEmail: string;
    voterName?: string;
    voteWeight: number;
    createdAt: string;
}

export interface EmailRecord {
    id: string;
    voteId?: string;
    buildingId?: string;
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    content: string;
    templateUsed?: string;
    sentAt: string;
    createdAt: string;
}

// Typy pro vytváření nového hlasování
export interface VoteForCreation {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    buildingId: string; // Povinné - vždy přiřazeno k budově
    options: string[]; // Možnosti hlasování
    type?: VoteType; // Typ hlasování
    daysDuration?: number; // Počet dní hlasování
    customQuorumParticipation?: number; // Minimální účast v % pro vlastní kvórum
    customQuorumApproval?: number; // Minimální souhlas v % pro vlastní kvórum
    questions?: Array<{
        text: string;
        choices: string[];
    }>; // Otázky
    emailTemplate?: string; // ID šablony
    customEmailSubject?: string; // Vlastní předmět emailu
    customEmailBody?: string; // Vlastní tělo emailu
}

// Legacy typy pro zpětnou kompatibilitu s mock daty
export type VoteStatus = 'draft' | 'active' | 'closed' | 'cancelled';
export type VoteType = 'simple' | 'qualified' | 'unanimous' | 'custom'; // 50%, 75%, 100%, vlastní
export type VoteChoice = 'PRO' | 'PROTI' | 'ZDRŽEL SE';

export interface Question {
    id: string;
    title: string;
    description: string;
    voteType: VoteType | 'custom';
    customQuorumNumerator?: number;
    customQuorumDenominator?: number;
}

export interface LegacyVote {
    id:string;
    title: string;
    description: string;
    status: VoteStatus;
    startDate: string;
    endDate: string;
    daysDuration: number;
    attachments: { name: string; url: string }[];
    questions: Question[];
    buildingId: string; // Link to a building
    observerEmails: string[];
    // New fields for advanced management
    emailLog: { memberId: string; timestamp: string; }[];
    memberTokens: Record<string, string>; // { [memberId]: "unique_token" }
    representativeOverrides: Record<string, string>; // { [representedMemberId]: "representativeMemberId" }
}

export interface UserVoteSubmission {
    id?: number;
    voteId: string;
    userId: string;
    memberId?: string; // Add for compatibility
    choices: {
        questionId: string;
        choice: VoteChoice;
    }[];
}


// --- CONTEXT & TOAST TYPES ---
export interface AppContextType {
  isLoading: boolean;
  
  // Building selection state
  selectedBuildingId: string | null;
  setSelectedBuildingId: (buildingId: string | null) => void;
  selectedBuilding?: Building | null; // Add for compatibility
  profile?: any; // Add for compatibility
  
  // Data Management (Supabase async)
  buildings: Building[];
  addBuilding: (building: Omit<Building, 'id'>) => Promise<void>;
  updateBuilding: (building: Building) => Promise<void>;
  deleteBuilding: (id: string) => Promise<void>;
  
  variables: Variable[];
  addVariable: (variable: Omit<Variable, 'id'>) => Promise<void>;
  updateVariable: (variable: Variable) => Promise<void>;
  deleteVariable: (id: string) => Promise<void>;

  emailTemplates: EmailTemplate[];
  addEmailTemplate: (template: Omit<EmailTemplate, 'id'>) => Promise<void>;
  updateEmailTemplate: (template: EmailTemplate) => Promise<void>;
  deleteEmailTemplate: (id: string) => Promise<void>;

  // Members (filtered by selected building)
  members: Member[];
  addMember: (member: Omit<Member, 'id'>) => Promise<void>;
  updateMember: (id: string, updates: Partial<Omit<Member, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  addMultipleMembers: (members: Omit<Member, 'id'>[]) => Promise<number>;
  
  // Voting System (filtered by selected building)
  votes: Vote[];
  voteOptions: Record<string, VoteOption[]>; // { [voteId]: VoteOption[] }
  castVotes: Record<string, CastVote[]>; // { [voteId]: CastVote[] }
  emailRecords: EmailRecord[];
  
  addVote: (vote: VoteForCreation) => Promise<Vote>;
  updateVote: (id: string, updates: Partial<Vote>) => Promise<void>;
  deleteVote: (id: string) => Promise<void>;
  castVote: (voteId: string, optionId: string, voterEmail: string, voterName?: string) => Promise<void>;
  hasUserVoted: (voteId: string, voterEmail: string) => Promise<boolean>;
  getVoteResults: (voteId: string) => Promise<any[]>;
  sendVoteEmails: (voteId: string, memberIds: string[]) => Promise<void>;
  
  // Legacy support for existing components
  users: User[];
  currentUser: User | null;
  setCurrentUserById: (id: string) => void;
  userVotes: UserVoteSubmission[];
  submitUserVote: (vote: UserVoteSubmission) => void;
  submitManualVote?: (vote: any) => Promise<void>; // Add for compatibility
  startVote?: (voteId: string) => Promise<void>; // Add for compatibility
  cancelVote?: (voteId: string) => Promise<void>; // Add for compatibility
  updateVoteRepresentative?: (voteId: string, memberId: string, representativeId: string) => Promise<void>; // Add for compatibility
}

export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

export interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}