import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Info, Clock } from 'lucide-react';
import { VOTE_CHOICE_CONFIG } from '../common/Pills';
import { Card, CardContent, CardHeader } from '../common/Card';

export const VotingProgressView = () => {
    const { votes, members, userVotes, profile, selectedBuilding } = useAppContext();
    const [selectedVoteId, setSelectedVoteId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'individual' | 'total'>('individual');
    
    const selectClasses = "w-full md:w-auto bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

    const activeVotes = useMemo(() => {
        if (profile?.role === 'observer') {
            return votes.filter(v => v.status === 'active' && v.observerEmails.includes(profile.full_name || ''));
        }
        return votes.filter(v => v.status === 'active');
    }, [votes, profile]);

    const selectedVote = useMemo(() => activeVotes.find(v => v.id === selectedVoteId), [activeVotes, selectedVoteId]);
    
    useEffect(() => {
        if (activeVotes.length > 0 && (!selectedVoteId || !activeVotes.some(v => v.id === selectedVoteId))) {
            setSelectedVoteId(activeVotes[0].id);
        } else if (activeVotes.length === 0) {
            setSelectedVoteId('');
        }
    }, [activeVotes, selectedVoteId]);

    const progressData = useMemo(() => {
        if (!selectedVote || !members.length) return null;

        const totalWeight = members.reduce((sum, member) => sum + member.voteWeight, 0);
        const votesCast = userVotes.filter(uv => uv.voteId === selectedVote.id);
        const votedMemberIds = new Set(votesCast.map(vc => vc.memberId));
        const votingMembers = members.filter(m => votedMemberIds.has(m.id));
        const votedWeight = votingMembers.reduce((sum, member) => sum + member.voteWeight, 0);

        const questionResults = selectedVote.questions.map(q => {
            const results = { PRO: 0, PROTI: 0, 'ZDRŽEL SE': 0 };
            votesCast.forEach(vc => {
                const choice = vc.choices.find(c => c.questionId === q.id)?.choice;
                const member = members.find(m => m.id === vc.memberId);
                if (choice && member) {
                    results[choice] += member.voteWeight;
                }
            });
            return { questionId: q.id, title: q.title, results };
        });

        return {
            totalWeight, votedWeight, totalMembers: members.length,
            votedMembers: votingMembers.length, questionResults,
            individualVotes: members.map(m => ({
                ...m,
                hasVoted: votedMemberIds.has(m.id),
                choices: selectedVote.questions.map(q => votesCast.find(vc => vc.memberId === m.id)?.choices.find(c => c.questionId === q.id)?.choice || null)
            }))
        };
    }, [selectedVote, members, userVotes]);
    
    const pageTitle = selectedVote && selectedBuilding ? `${selectedBuilding.name} | ${selectedVote.title}` : 'Průběh hlasování';

    if (activeVotes.length === 0) {
        return <div className="text-center py-16"><Info className="mx-auto h-12 w-12 text-gray-500" /><h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Žádná aktivní hlasování</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Momentálně neprobíhá žádné hlasování.</p></div>
    }

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate" title={pageTitle}>{pageTitle}</h1>
                <select value={selectedVoteId} onChange={e => setSelectedVoteId(e.target.value)} className={selectClasses}>
                    <option value="">-- Vyberte hlasování --</option>
                    {activeVotes.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                </select>
            </div>
            
            {selectedVote && progressData && (
                <Card>
                    <CardHeader>
                        <div className="bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg flex items-center gap-2 self-start w-min">
                             <button onClick={() => setActiveTab('individual')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'individual' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}>Individuální</button>
                             <button onClick={() => setActiveTab('total')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'total' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}>Celkový</button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {activeTab === 'individual' && (
                             <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-100 dark:bg-gray-700/50">
                                      <tr>
                                        <th className="p-4 font-semibold sticky left-0 bg-gray-100 dark:bg-gray-700/50">Člen (Jednotka)</th>
                                        {selectedVote.questions.map(q => <th key={q.id} className="p-4 font-semibold text-center whitespace-nowrap">{q.title}</th>)}
                                      </tr>
                                    </thead>
                                    <tbody>
                                        {progressData.individualVotes.map(m => (
                                            <tr key={m.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                <td className="p-4 font-medium sticky left-0 bg-white dark:bg-gray-800 whitespace-nowrap">{m.name} ({m.unitNumber})</td>
                                                {m.choices.map((choice, index) => {
                                                  const config = choice ? VOTE_CHOICE_CONFIG[choice] : null;
                                                  return (
                                                    <td key={index} className="p-4 text-center">
                                                      {config ? (<span className={`flex items-center justify-center gap-2 ${config.className}`}><config.icon className="w-5 h-5"/><span className="hidden sm:inline">{config.text}</span></span>)
                                                      : (<span className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400"><Clock className="w-5 h-5"/><span className="hidden sm:inline">Čeká</span></span>)}
                                                    </td>
                                                  )
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {activeTab === 'total' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg"><h4 className="font-semibold text-gray-900 dark:text-white">Účast členů</h4><p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{progressData.votedMembers} / {progressData.totalMembers}</p><div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2"><div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${(progressData.votedMembers / progressData.totalMembers) * 100}%`}}></div></div></div>
                                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg"><h4 className="font-semibold text-gray-900 dark:text-white">Účast dle váhy hlasů</h4><p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{progressData.votedWeight} / {progressData.totalWeight}</p><div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2"><div className="bg-purple-600 h-2.5 rounded-full" style={{width: `${(progressData.votedWeight / progressData.totalWeight) * 100}%`}}></div></div></div>
                                </div>
                                <div className="space-y-6">
                                    {progressData.questionResults.map(q => {
                                        const proPercent = progressData.totalWeight > 0 ? (q.results.PRO / progressData.totalWeight) * 100 : 0;
                                        const protiPercent = progressData.totalWeight > 0 ? (q.results.PROTI / progressData.totalWeight) * 100 : 0;
                                        const zdrzelPercent = progressData.totalWeight > 0 ? (q.results['ZDRŽEL SE'] / progressData.totalWeight) * 100 : 0;
                                        return (
                                        <div key={q.questionId} className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{q.title}</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between items-center"><span className="text-green-600 dark:text-green-400 font-medium">PRO ({q.results.PRO})</span><span>{proPercent.toFixed(1)}%</span></div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className="bg-green-600 h-4 rounded-full" style={{width: `${proPercent}%`}}></div></div>
                                                <div className="flex justify-between items-center pt-2"><span className="text-red-600 dark:text-red-400 font-medium">PROTI ({q.results.PROTI})</span><span>{protiPercent.toFixed(1)}%</span></div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className="bg-red-600 h-4 rounded-full" style={{width: `${protiPercent}%`}}></div></div>
                                                <div className="flex justify-between items-center pt-2"><span className="text-gray-600 dark:text-gray-400 font-medium">ZDRŽEL SE ({q.results['ZDRŽEL SE']})</span><span>{zdrzelPercent.toFixed(1)}%</span></div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className="bg-gray-500 h-4 rounded-full" style={{width: `${zdrzelPercent}%`}}></div></div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};