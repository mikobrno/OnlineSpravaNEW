import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Vote } from '../../types';
import { Users } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { VOTE_STATUS_CONFIG } from '../common/Pills';
import { replaceVariables } from '../../lib/utils';
import { TimeLeftIndicator } from './TimeLeftIndicator';

export const VoteCard = ({ vote, onSelect }: { vote: Vote; onSelect: (voteId: string) => void; }) => {
    const { variables, selectedBuilding } = useAppContext();
    const StatusIcon = VOTE_STATUS_CONFIG[vote.status].icon;
    const statusClassName = VOTE_STATUS_CONFIG[vote.status].className;

    return (
        <Card onClick={() => onSelect(vote.id)}>
            <CardHeader className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{vote.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedBuilding?.name || 'Neznámá budova'}</p>
                </div>
                 <span className={`flex items-center gap-2 text-sm font-semibold px-2.5 py-1 rounded-full ${statusClassName}`}>
                    <StatusIcon className="h-4 w-4" />
                    {VOTE_STATUS_CONFIG[vote.status].label}
                </span>
            </CardHeader>
            <CardContent>
                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">{replaceVariables(vote.description, selectedBuilding, variables, vote)}</p>
            </CardContent>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <TimeLeftIndicator endDate={vote.endDate} status={vote.status} />
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{vote.questions.length} {vote.questions.length > 4 ? 'otázek' : (vote.questions.length > 1 ? 'otázky' : 'otázka')}</span>
                </div>
            </div>
        </Card>
    );
};
