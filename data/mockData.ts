import { Building, Variable, EmailTemplate, Member, Vote, UserVoteSubmission } from '../types';

export const MOCK_VARIABLES: Variable[] = [
  { id: 1, key: 'nazev_spolecnosti', description: 'Název správcovské společnosti', type: 'global', value: 'OnlineSprava s.r.o.' },
  { id: 2, key: 'kontaktni_email', description: 'Kontaktní email podpory', type: 'global', value: 'podpora@onlinesprava.cz' },
  { id: 3, key: 'podpis_spravce', description: 'Výchozí podpis v emailu', type: 'global', value: 'S pozdravem,\nTým OnlineSprava' },
  { id: 4, key: 'plny_nazev', description: 'Plný název SVJ/BD', type: 'building' },
  { id: 5, key: 'zkraceny_nazev', description: 'Zkrácený název pro předměty', type: 'building' },
  { id: 6, key: 'osloveni', description: 'Způsob oslovení členů', type: 'building' },
  { id: 7, key: 'adresa', description: 'Adresa budovy', type: 'building' },
  { id: 8, key: 'ico', description: 'IČO', type: 'building' },
  { id: 9, key: 'kontaktni_osoba', description: 'Kontaktní osoba pro dům', type: 'building' },
  { id: 10, key: 'jmeno_zastupce', description: 'Jméno zákonného zástupce člena', type: 'building'},
  { id: 11, key: 'hlasovaci_odkaz', description: 'Unikátní odkaz na hlasování pro člena', type: 'building'},
];

export const MOCK_BUILDINGS: Building[] = [
  {
    id: 'b1',
    name: 'SVJ Nová Ulice 123',
    owner_id: 'user1',
    data: {
      plny_nazev: 'Společenství vlastníků jednotek Nová Ulice 123',
      zkraceny_nazev: 'SVJ Nová Ulice',
      osloveni: 'Vážení vlastníci',
      adresa: 'Nová Ulice 123, 110 00 Praha 1',
      ico: '12345678',
      kontaktni_osoba: 'Jan Novák',
      jmeno_zastupce: '', // This will be dynamically filled
    },
  },
  {
    id: 'b2',
    name: 'BD Sluneční 45',
    owner_id: 'user1',
    data: {
      plny_nazev: 'Bytové družstvo Sluneční 45',
      zkraceny_nazev: 'BD Sluneční',
      osloveni: 'Vážení družstevníci',
      adresa: 'Sluneční 45, 602 00 Brno',
      ico: '87654321',
      kontaktni_osoba: 'Eva Dvořáková',
      jmeno_zastupce: '', // This will be dynamically filled
    },
  },
];

export const MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 't1',
    name: 'Pozvánka k hlasování',
    category: 'Hlasování',
    subject: 'Pozvánka k online hlasování - {{zkraceny_nazev}}',
    body: `{{osloveni}},\n\nzveme Vás k online hlasování "{{title}}", které probíhá od D.M.RRRR do D.M.RRRR.\n\nPro odhlasování prosím klikněte na následující unikátní odkaz:\n{{hlasovaci_odkaz}}\n\nPodrobnosti naleznete v detailu hlasování.\n\n{{podpis_spravce}}`,
  },
  {
    id: 't4',
    name: 'Pozvánka pro zástupce',
    category: 'Hlasování - Zastupování',
    subject: 'Pozvánka k hlasování v zastoupení - {{zkraceny_nazev}}',
    body: `{{osloveni}},\n\nzveme Vás k online hlasování "{{title}}", ve kterém vystupujete jako zástupce.\n\nPro odhlasování prosím klikněte na následující unikátní odkaz:\n{{hlasovaci_odkaz}}\n\n{{podpis_spravce}}`,
  },
  {
    id: 't5',
    name: 'Informace pro zastoupeného',
    category: 'Hlasování - Zastupování',
    subject: 'Informace o hlasování - {{zkraceny_nazev}}',
    body: `{{osloveni}},\n\ninformujeme Vás, že bylo zahájeno hlasování "{{title}}".\n\nV tomto hlasování Vás plně zastupuje {{jmeno_zastupce}}.\n\nO výsledku hlasování Vás budeme informovat.\n\n{{podpis_spravce}}`,
  },
  {
    id: 't2',
    name: 'Upozornění na odečty měřidel',
    category: 'Informativní',
    subject: 'Odečty měřidel v domě {{zkraceny_nazev}}',
    body: `{{osloveni}},\n\ndovolujeme si Vás informovat, že dne D.M.RRRR proběhnou v domě odečty měřidel tepla a vody. Prosíme o zpřístupnění Vašich jednotek.\n\nDěkujeme za spolupráci.\n\n{{podpis_spravce}}`,
  },
  {
    id: 't3',
    name: 'Upomínka platby',
    category: 'Notifikace',
    subject: 'Upomínka k úhradě poplatků - {{zkraceny_nazev}}',
    body: `{{osloveni}},\n\ndovolujeme si Vás upozornit na neuhrazenou platbu za služby spojené s užíváním jednotky.\n\nProsíme o urychlenou kontrolu Vašich plateb a případnou úhradu.\n\nV případě dotazů nás kontaktujte na {{kontaktni_email}}.\n\n{{podpis_spravce}}`
  },
];

export const MOCK_MEMBERS: Member[] = [
    { id: 'm1', name: 'Jan Novák', email: 'jan.novak@email.cz', unitNumber: '101', voteWeight: 120, buildingId: 'b1', phone: '123456789' },
    { id: 'm2', name: 'Eva Dvořáková', email: 'eva.dvorakova@email.cz', unitNumber: '102', voteWeight: 110, buildingId: 'b1', phone: '987654321' },
    { id: 'm3', name: 'Petr Svoboda', email: 'petr.svoboda@email.cz', unitNumber: '103', voteWeight: 130, buildingId: 'b1', representedByMemberId: 'm1' },
    { id: 'm4', name: 'Lucie Bílá', email: 'lucie.bila@email.cz', unitNumber: 'A1', voteWeight: 95, buildingId: 'b2', phone: '111222333' },
    { id: 'm5', name: 'Karel Gott', email: 'karel.gott@email.cz', unitNumber: 'A2', voteWeight: 105, buildingId: 'b2', phone: '444555666' },
];

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);


export const MOCK_VOTES: Vote[] = [
    {
        id: 'v1',
        buildingId: 'b1',
        title: 'Hlasování o rekonstrukci střechy',
        description: 'Předmětem hlasování je schválení nákladů na kompletní rekonstrukci střešního pláště budovy {{plny_nazev}}. Předpokládané náklady činí 1.500.000 Kč a budou hrazeny z fondu oprav.',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: nextWeek.toISOString(),
        daysDuration: 7,
        attachments: [{ name: 'Rozpočet_střechy.pdf', url: '#' }],
        questions: [
            { id: 'q1', title: 'Schválení rekonstrukce střechy', description: 'Souhlasíte s provedením rekonstrukce dle předloženého rozpočtu?', voteType: 'qualified' },
        ],
        observerEmails: ['observer@stavba.cz'],
        emailLog: [],
        memberTokens: {},
        representativeOverrides: {},
        created_by: 'user1',
    },
    {
        id: 'v2',
        buildingId: 'b1',
        title: 'Volba nového člena výboru',
        description: 'Hlasování o přijetí pana Petra Svobody za nového člena výboru SVJ na následující volební období.',
        status: 'closed',
        startDate: lastWeek.toISOString(),
        endDate: yesterday.toISOString(),
        daysDuration: 6,
        attachments: [],
        questions: [
            { id: 'q2', title: 'Zvolení pana Svobody', description: 'Souhlasíte se zvolením pana Petra Svobody, bytem 103, za nového člena výboru?', voteType: 'simple' },
        ],
        observerEmails: [],
        emailLog: [],
        memberTokens: {},
        representativeOverrides: {},
        created_by: 'user1',
    },
    {
        id: 'v3',
        buildingId: 'b2',
        title: 'Instalace nabíjecích stanic pro elektromobily',
        description: 'Návrh na instalaci dvou nabíjecích stanic v společných garážích. Tento krok reaguje na rostoucí poptávku po elektromobilitě mezi vlastníky.',
        status: 'draft',
        startDate: tomorrow.toISOString(),
        endDate: new Date(nextWeek.getTime() + (1000 * 60 * 60 * 24 * 7)).toISOString(),
        daysDuration: 14,
        attachments: [{ name: 'Nabídka_stanice.pdf', url: '#' }, { name: 'Technická_specifikace.pdf', url: '#' }],
        questions: [
            { id: 'q3a', title: 'Schválení instalace', description: 'Souhlasíte s instalací nabíjecích stanic v garážích?', voteType: 'simple' },
            { id: 'q3b', title: 'Schválení financování', description: 'Souhlasíte s čerpáním úvěru ve výši 250.000 Kč na financování instalace?', voteType: 'custom', customQuorumNumerator: 2, customQuorumDenominator: 3 },
        ],
        observerEmails: ['observer@stavba.cz', 'another@observer.com'],
        emailLog: [],
        memberTokens: {},
        representativeOverrides: {},
        created_by: 'user1',
    },
    {
        id: 'v4',
        buildingId: 'b1',
        title: 'Změna stanov společenství',
        description: 'Hlasování o navrhované změně stanov týkající se pravidel pro krátkodobé pronájmy jednotek.',
        status: 'cancelled',
        startDate: new Date().toISOString(),
        endDate: nextWeek.toISOString(),
        daysDuration: 7,
        attachments: [{ name: 'Navrh_zmeny_stanov.pdf', url: '#' }],
        questions: [
            { id: 'q4', title: 'Schválení nových stanov', description: 'Souhlasíte s navrhovanou úpravou stanov?', voteType: 'unanimous' },
        ],
        observerEmails: [],
        emailLog: [],
        memberTokens: {},
        representativeOverrides: {},
        created_by: 'user1',
    }
];

export const MOCK_USER_VOTES: UserVoteSubmission[] = [
    { 
        id: 1,
        voteId: 'v2', 
        memberId: 'm1',
        userId: 'user2',
        choices: [{ questionId: 'q2', choice: 'PRO' }],
        submissionType: 'online',
        submittedAt: new Date().toISOString(),
    }
];