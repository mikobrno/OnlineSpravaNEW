import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { VoteStatus } from '../../types';
import { Search, Plus, FileWarning } from 'lucide-react';

import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { VoteCard } from './VoteCard';

export const VotesListView = ({ onSelectVote, onCreateVote, filter, onFilterChange }: { 
    onSelectVote: (voteId: string) => void;
    onCreateVote: () => void;
    filter: VoteStatus | 'all';
    onFilterChange: (newFilter: VoteStatus | 'all') => void;
}) => {
    const { votes, profile } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');
    
    const FILTERS: Record<string, { id: VoteStatus | 'all'; name: string }[]> = {
        admin: [ { id: 'all', name: 'Všechny' }, { id: 'draft', name: 'Návrhy' }, { id: 'active', name: 'Aktivní' }, { id: 'closed', name: 'Ukončené' }, { id: 'cancelled', name: 'Zrušené' }],
        member: [ { id: 'active', name: 'Aktivní' }, { id: 'closed', name: 'Ukončené' }],
        observer: [ { id: 'active', name: 'Aktivní' }, { id: 'closed', name: 'Ukončené' }],
    }
    
    const availableFilters = FILTERS[profile?.role || 'member'] || [];

    const filteredVotes = useMemo(() => {
        let userVotes = votes;
        
        if (profile?.role === 'observer') {
            userVotes = votes.filter(v => v.observerEmails.includes(profile.full_name || ''));
        }

        return userVotes.filter(vote => {
            const matchesFilter = filter === 'all' || vote.status === filter;
            const matchesSearch = vote.title.toLowerCase().includes(searchQuery.toLowerCase()) || vote.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [votes, filter, searchQuery, profile]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Přehled hlasování</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Zde najdete všechna dostupná hlasování pro vybranou budovu.</p>
                </div>
                <div className='flex items-center gap-2'>
                    <div className="relative min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input placeholder="Hledat hlasování..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                    </div>
                    {profile?.role === 'admin' && (
                        <Button onClick={onCreateVote} className="whitespace-nowrap"><Plus className="h-5 w-5"/> Nové hlasování</Button>
                    )}
                </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg flex items-center gap-2 overflow-x-auto">
                {availableFilters.map(f => (
                    <button key={f.id} onClick={() => onFilterChange(f.id)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${filter === f.id ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}>
                        {f.name}
                    </button>
                ))}
            </div>

            {filteredVotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVotes.map(vote => <VoteCard key={vote.id} vote={vote} onSelect={onSelectVote} />)}
                </div>
            ) : (
                <div className="text-center py-16">
                    <FileWarning className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Nenalezena žádná hlasování</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Pro zadané filtry nebylo nalezeno žádné hlasování.</p>
                </div>
            )}
        </div>
    );
};