import { CheckSquare, XSquare, MinusSquare, PlayCircle, FileText, CheckCircle, XCircle } from "lucide-react";
import { VoteStatus, VoteType, VoteChoice } from "../../types";

export const VOTE_STATUS_CONFIG: { [key in VoteStatus]: { label: string; icon: React.ElementType; className: string; } } = { 
    draft: { label: 'Návrh', icon: FileText, className: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400' }, 
    active: { label: 'Aktivní', icon: PlayCircle, className: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' }, 
    closed: { label: 'Ukončeno', icon: CheckSquare, className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' }, 
    cancelled: { label: 'Zrušeno', icon: XSquare, className: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' } 
};

export const VOTE_TYPE_CONFIG: { [key in VoteType]: { label: string; majority: string; requiredPercentage: number } } = { 
    simple: { label: 'Prostá většina', majority: '>50 % přítomných', requiredPercentage: 50 }, 
    qualified: { label: 'Kvalifikovaná většina', majority: '≥75 % všech', requiredPercentage: 75 }, 
    unanimous: { label: 'Jednomyslná většina', majority: '100 % všech', requiredPercentage: 100 }, 
};

export const VOTE_CHOICE_CONFIG: {[key in VoteChoice]: { icon: React.ElementType, text: string, className: string }} = { 
    'PRO': { icon: CheckCircle, text: 'Pro', className: 'text-green-600 dark:text-green-400' }, 
    'PROTI': { icon: XCircle, text: 'Proti', className: 'text-red-600 dark:text-red-400' }, 
    'ZDRŽEL SE': { icon: MinusSquare, text: 'Zdržel se', className: 'text-yellow-600 dark:text-yellow-400' }
};
