import { Building, Member, Question, Variable, Vote, VoteType } from '../types';
import { VOTE_TYPE_CONFIG } from '../components/common/Pills';

export const formatDate = (dateString: string) => new Date(dateString).toLocaleString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const getQuestionQuorumInfo = (question: Question): string => {
    if (question.voteType === 'custom' && question.customQuorumNumerator && question.customQuorumDenominator) {
        return `Vlastní kvórum (${question.customQuorumNumerator}/${question.customQuorumDenominator})`;
    }
    return VOTE_TYPE_CONFIG[question.voteType as VoteType]?.label || 'Neznámý typ';
};

export const replaceVariables = (
    text: string, 
    building: Building | null, 
    allVariables: Variable[], 
    vote?: Partial<Vote> | null,
    member?: Member | null,
    allMembers?: Member[]
): string => {
  let result = text;
  
  allVariables.filter(v => v.type === 'global').forEach(v => {
    result = result.replace(new RegExp(`{{${v.key}}}`, 'g'), v.value || '');
  });

  if (building) {
    allVariables.filter(v => v.type === 'building' && v.key !== 'jmeno_zastupce').forEach(v => {
      const value = building.data[v.key] || '';
      result = result.replace(new RegExp(`{{${v.key}}}`, 'g'), value);
    });
    result = result.replace(new RegExp(`{{name}}`, 'g'), building.name);
  }

  if (vote) {
    result = result.replace(new RegExp(`{{title}}`, 'g'), vote.title || '');
    result = result.replace(new RegExp(`{{description}}`, 'g'), vote.description || '');
  }

  if (member) {
      if (member.representedByMemberId && allMembers) {
          const representative = allMembers.find(m => m.id === member.representedByMemberId);
          result = result.replace(new RegExp(`{{jmeno_zastupce}}`, 'g'), representative?.name || 'Neznámý zástupce');
      }
      
      const token = vote?.memberTokens?.[member.id];
      if (token) {
        // Ensure production-ready URL without port number
        const origin = window.location.origin.includes('localhost') ? window.location.origin : `${window.location.protocol}//${window.location.hostname}`;
        const voteUrl = `${origin}/hlasovani/${token}`;
        result = result.replace(new RegExp(`{{hlasovaci_odkaz}}`, 'g'), voteUrl);
      }
  }
  
  // Clean up any un-replaced variables
  return result.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, '');
};
