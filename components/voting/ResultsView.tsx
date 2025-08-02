import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Archive, Download, Wand2, Info } from 'lucide-react';

import { VOTE_CHOICE_CONFIG } from '../common/Pills';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { AIGeneratorModal } from './AIGeneratorModal';
import { formatDate } from '../../lib/utils';

export const ResultsView = () => {
    const { votes, members, userVotes, profile, selectedBuilding } = useAppContext();
    const { addToast } = useToast();
    const [selectedVoteId, setSelectedVoteId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'total' | 'individual'>('total');
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    
    const selectClasses = "w-full md:w-auto bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

    const closedVotes = useMemo(() => {
        const relevantVotes = votes.filter(v => ['closed', 'cancelled'].includes(v.status));
        if (profile?.role === 'observer') {
            return relevantVotes.filter(v => v.observerEmails.includes(profile.full_name || ''));
        }
        return relevantVotes;
    }, [votes, profile]);

    const selectedVote = useMemo(() => closedVotes.find(v => v.id === selectedVoteId), [closedVotes, selectedVoteId]);

    useEffect(() => {
        if (closedVotes.length > 0 && (!selectedVoteId || !closedVotes.some(v => v.id === selectedVoteId))) {
            setSelectedVoteId(closedVotes[0].id);
        } else if (closedVotes.length === 0) {
            setSelectedVoteId('');
        }
    }, [closedVotes, selectedVoteId]);


    const resultsData = useMemo(() => {
        if (!selectedVote || !members.length) return null;

        const totalWeight = members.reduce((sum, member) => sum + member.voteWeight, 0);
        const votesCast = userVotes.filter(uv => uv.voteId === selectedVote.id);
        const votedMemberIds = new Set(votesCast.map(vc => vc.memberId));
        
        const questionResults = selectedVote.questions.map(q => {
            const results = { PRO: 0, PROTI: 0, 'ZDRŽEL SE': 0 };
            votesCast.forEach(vc => {
                const choice = vc.choices.find(c => c.questionId === q.id)?.choice;
                const member = members.find(m => m.id === vc.memberId);
                if (choice && member) {
                    results[choice] += member.voteWeight;
                }
            });

            let passed = false;
            const proWeight = results.PRO;
            const protiWeight = results.PROTI;
            
            if(selectedVote.status === 'closed') {
                switch(q.voteType) {
                    case 'simple':
                        passed = proWeight > protiWeight;
                        break;
                    case 'qualified':
                        passed = (proWeight / totalWeight) >= 0.75;
                        break;
                    case 'unanimous':
                        passed = proWeight === totalWeight;
                        break;
                    case 'custom':
                        if (q.customQuorumNumerator && q.customQuorumDenominator) {
                            passed = (proWeight / totalWeight) >= (q.customQuorumNumerator / q.customQuorumDenominator);
                        }
                        break;
                }
            }

            return { questionId: q.id, title: q.title, description: q.description, results, passed };
        });

        return {
            totalWeight,
            votedMembersCount: votedMemberIds.size,
            totalMembersCount: members.length,
            questionResults,
            individualVotes: members.map(m => {
                const voteSubmission = votesCast.find(vc => vc.memberId === m.id);
                return {
                    ...m,
                    choices: selectedVote.questions.map(q => voteSubmission?.choices.find(c => c.questionId === q.id)?.choice || null)
                }
            })
        };
    }, [selectedVote, members, userVotes]);

    const handleGeneratePdf = () => {
        if (!selectedVote || !selectedBuilding || !resultsData) {
            addToast('Pro export PDF nejprve vyberte ukončené hlasování.', 'error');
            return;
        }

        const doc = new jsPDF();
        
        doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/FiraCode-Regular.ttf', 'FiraCode', 'normal');
        doc.setFont('FiraCode');
        
        doc.setFontSize(18);
        doc.text(`Protokol o výsledku hlasování per rollam`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Budova: ${selectedBuilding.name}`, 14, 30);
        doc.text(`Název hlasování: ${selectedVote.title}`, 14, 36);
        doc.text(`Datum konání: ${formatDate(selectedVote.startDate)} - ${formatDate(selectedVote.endDate)}`, 14, 42);

        autoTable(doc, {
            startY: 50,
            body: [
                ['Celkový počet členů', resultsData.totalMembersCount],
                ['Hlasujících členů', resultsData.votedMembersCount],
                ['Celková váha hlasů', resultsData.totalWeight],
                ['Účast', `${((resultsData.votedMembersCount / resultsData.totalMembersCount) * 100).toFixed(2)} %`],
            ],
            theme: 'grid',
            styles: { font: 'FiraCode' }
        });

        let yPos = (doc as any).lastAutoTable.finalY + 10;
        
        resultsData.questionResults.forEach((q, index) => {
            doc.setFontSize(14);
            doc.text(`Bod ${index + 1}: ${q.title}`, 14, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.text(`Výsledek: ${selectedVote.status === 'cancelled' ? 'ZRUŠENO' : (q.passed ? 'SCHVÁLENO' : 'ZAMÍTNUTO')}`, 14, yPos);
            yPos += 10;
            
            autoTable(doc, {
                startY: yPos,
                head: [['Volba', 'Váha hlasů', 'Podíl na celku']],
                body: [
                    ['PRO', q.results.PRO, `${((q.results.PRO / resultsData.totalWeight) * 100).toFixed(2)} %`],
                    ['PROTI', q.results.PROTI, `${((q.results.PROTI / resultsData.totalWeight) * 100).toFixed(2)} %`],
                    ['ZDRŽEL SE', q.results['ZDRŽEL SE'], `${((q.results['ZDRŽEL SE'] / resultsData.totalWeight) * 100).toFixed(2)} %`]
                ],
                theme: 'striped',
                styles: { font: 'FiraCode' }
            });
            yPos = (doc as any).lastAutoTable.finalY + 15;
        });

        doc.addPage();
        doc.setFontSize(16);
        doc.text('Individuální výsledky hlasování', 14, 22);

        const head = [['Člen (Jednotka)', ...selectedVote.questions.map(q => q.title)]];
        const body = resultsData.individualVotes.map(iv => [`${iv.name} (${iv.unitNumber})`, ...iv.choices.map(c => c || 'Nehlasoval')]);

        autoTable(doc, {
            startY: 30,
            head: head,
            body: body,
            theme: 'grid',
            styles: { font: 'FiraCode' }
        });


        doc.save(`vysledky_${selectedVote.title.replace(/ /g, '_')}.pdf`);
        addToast('PDF protokol byl vygenerován.', 'success');
    };

    const pageTitle = selectedVote && selectedBuilding ? `Výsledky: ${selectedBuilding.name} | ${selectedVote.title}` : 'Výsledky hlasování';
    
    if (closedVotes.length === 0) {
        return <div className="text-center py-16"><Archive className="mx-auto h-12 w-12 text-gray-500" /><h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Žádná ukončená hlasování</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Zatím zde nejsou žádná ukončená nebo zrušená hlasování.</p></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate" title={pageTitle}>{pageTitle}</h1>
                <div className="flex items-center gap-2">
                    {selectedVote && profile?.role === 'admin' && <Button onClick={() => setIsAIModalOpen(true)} variant="secondary"><Wand2 className="w-4 h-4" /> Vygenerovat zápis (AI)</Button>}
                    {selectedVote && <Button onClick={handleGeneratePdf} variant="secondary"><Download className="w-4 h-4" /> Exportovat PDF</Button>}
                    <select value={selectedVoteId} onChange={e => setSelectedVoteId(e.target.value)} className={selectClasses}>
                        <option value="">-- Vyberte hlasování --</option>
                        {closedVotes.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                    </select>
                </div>
            </div>

            {selectedVote && resultsData && (
                <Card>
                    <CardHeader>
                        <div className="bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg flex items-center gap-2 self-start w-min">
                             <button onClick={() => setActiveTab('total')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${activeTab === 'total' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}>Celkové výsledky</button>
                             <button onClick={() => setActiveTab('individual')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${activeTab === 'individual' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}>Individuální přehled</button>
                        </div>
                    </CardHeader>
                     <CardContent>
                        {activeTab === 'total' && (
                             <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Účast členů</h4>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{resultsData.votedMembersCount} / {resultsData.totalMembersCount}</p>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2"><div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${(resultsData.votedMembersCount / resultsData.totalMembersCount) * 100}%`}}></div></div>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Účast dle váhy hlasů</h4>
                                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Object.values(resultsData.questionResults[0].results).reduce((a,b) => a+b,0)} / {resultsData.totalWeight}</p>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2"><div className="bg-purple-600 h-2.5 rounded-full" style={{width: `${(Object.values(resultsData.questionResults[0].results).reduce((a,b) => a+b,0) / resultsData.totalWeight) * 100}%`}}></div></div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                {resultsData.questionResults.map(q => {
                                    const proPercent = resultsData.totalWeight > 0 ? (q.results.PRO / resultsData.totalWeight) * 100 : 0;
                                    const protiPercent = resultsData.totalWeight > 0 ? (q.results.PROTI / resultsData.totalWeight) * 100 : 0;
                                    const zdrzelPercent = resultsData.totalWeight > 0 ? (q.results['ZDRŽEL SE'] / resultsData.totalWeight) * 100 : 0;
                                    const resultConfig = selectedVote.status === 'cancelled' ? {label: 'ZRUŠENO', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400'} : (q.passed ? {label: 'SCHVÁLENO', className: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'} : {label: 'ZAMÍTNUTO', className: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'});
                                    return (
                                        <div key={q.questionId} className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{q.title}</h4>
                                                <span className={`px-3 py-1 text-sm font-bold rounded-full ${resultConfig.className}`}>{resultConfig.label}</span>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between items-center"><span className="text-green-600 dark:text-green-400 font-medium">PRO ({q.results.PRO})</span><span>{proPercent.toFixed(1)}%</span></div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className="bg-green-600 h-4 rounded-full" style={{width: `${proPercent}%`}}></div></div>
                                                
                                                <div className="flex justify-between items-center pt-2"><span className="text-red-600 dark:text-red-400 font-medium">PROTI ({q.results.PROTI})</span><span>{protiPercent.toFixed(1)}%</span></div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className="bg-red-600 h-4 rounded-full" style={{width: `${protiPercent}%`}}></div></div>

                                                <div className="flex justify-between items-center pt-2"><span className="text-gray-600 dark:text-gray-400 font-medium">ZDRŽEL SE ({q.results['ZDRŽEL SE']})</span><span>{zdrzelPercent.toFixed(1)}%</span></div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className="bg-gray-500 h-4 rounded-full" style={{width: `${zdrzelPercent}%`}}></div></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                </div>
                            </div>
                        )}
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
                                        {resultsData.individualVotes.map(m => (
                                            <tr key={m.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="p-4 font-medium sticky left-0 bg-white dark:bg-gray-800 whitespace-nowrap">{m.name} ({m.unitNumber})</td>
                                                {m.choices.map((choice, index) => {
                                                  const config = choice ? VOTE_CHOICE_CONFIG[choice] : null;
                                                  return (
                                                    <td key={index} className="p-4 text-center">
                                                      {config ? (
                                                        <span className={`flex items-center justify-center gap-2 ${config.className}`}>
                                                          <config.icon className="w-5 h-5"/>
                                                          <span className="hidden sm:inline">{config.text}</span>
                                                        </span>
                                                      ) : (
                                                        <span className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                                                          <Info className="w-5 h-5"/>
                                                          <span className="hidden sm:inline">Nehlasoval/a</span>
                                                        </span>
                                                      )}
                                                    </td>
                                                  )
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                     </CardContent>
                </Card>
            )}
             {selectedVote && resultsData && (
                 <AIGeneratorModal
                    isOpen={isAIModalOpen}
                    onClose={() => setIsAIModalOpen(false)}
                    vote={selectedVote}
                    building={selectedBuilding}
                    results={resultsData}
                 />
            )}
        </div>
    );
}