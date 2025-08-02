import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { Member, Vote } from '../../types';
import { Copy, Edit, PlayCircle, XCircle, Send, RefreshCw, Paperclip, Building2, UserPlus, UserCog, CheckCircle, Pencil } from 'lucide-react';

import { PageHeader } from '../common/PageHeader';
import { Button } from '../common/Button';
import { Card, CardContent, CardHeader } from '../common/Card';
import { VOTE_STATUS_CONFIG } from '../common/Pills';
import { formatDate, getQuestionQuorumInfo, replaceVariables } from '../../lib/utils';
import { ChangeRepresentativeModal } from '../members/ChangeRepresentativeModal';
import { ManualVoteEntryModal } from './ManualVoteEntryModal';

export const VoteDetailView = ({ voteId, onBack, onEdit, onVoteStarted, onVoteCopied }: { 
    voteId: string; 
    onBack: () => void; 
    onEdit: (voteId: string) => void; 
    onVoteStarted: () => void; 
    onVoteCopied: (newVoteId: string) => void; 
}) => {
    const { votes, selectedBuilding, variables, members, startVote, cancelVote, sendVoteEmails, updateVoteRepresentative, addVote, userVotes } = useAppContext();
    const { addToast } = useToast();
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [isRepModalOpen, setIsRepModalOpen] = useState(false);
    const [isManualVoteModalOpen, setIsManualVoteModalOpen] = useState(false);
    const [activeMember, setActiveMember] = useState<Member | null>(null);

    const vote = useMemo(() => votes.find(v => v.id === voteId), [votes, voteId]);

    const votedMemberIds = useMemo(() => {
        return new Set(userVotes.filter(uv => uv.voteId === voteId).map(uv => uv.memberId));
    }, [userVotes, voteId]);

    if (!vote) return <div className="text-center py-16">...</div>;

    const building = selectedBuilding;
    
    const handleStartVote = () => {
        if (window.confirm('Opravdu si přejete spustit toto hlasování? Po spuštění již nebude možné provádět úpravy a všem členům budou odeslány pozvánky.')) {
            startVote(vote.id);
            addToast('Hlasování bylo úspěšně spuštěno a pozvánky odeslány.', 'success');
            onVoteStarted();
        }
    };
    
    const handleCancelVote = () => {
         if (window.confirm('Opravdu si přejete zrušit toto hlasování? Tato akce je nevratná.')) {
            cancelVote(vote.id);
            addToast('Hlasování bylo zrušeno.', 'info');
        }
    };
    
    const handleCopyVote = async () => {
        const { id, status, startDate, endDate, emailLog, memberTokens, representativeOverrides, created_by, questions, ...restOfVote } = vote;
        const newVoteData = {
            ...restOfVote,
            title: `${vote.title} (Kopie)`,
            startDate: new Date().toISOString(),
            questions: questions.map(({id, ...q}) => q),
        };
        const newVoteId = await addVote(newVoteData);
        if (newVoteId) {
            addToast('Hlasování bylo zkopírováno.', 'success');
            onVoteCopied(newVoteId);
        }
    };

    const handleSendEmails = (memberIds: string[]) => {
        sendVoteEmails(vote.id, memberIds);
        addToast(`E-mailové pozvánky byly odeslány ${memberIds.length} členům.`, 'success');
        setSelectedMembers(new Set());
    };
    
    const handleExportBallots = () => {
        const doc = new jsPDF();
        doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/FiraCode-Regular.ttf', 'FiraCode', 'normal');
        doc.setFont('FiraCode');
        
        members.forEach((member, i) => {
            if (i > 0) doc.addPage();
            
            doc.setFontSize(16);
            doc.text('Hlasovací lístek', 105, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text(`Hlasování: ${vote.title}`, 14, 35);
            doc.text(`Budova: ${building?.name || ''}`, 14, 42);

            autoTable(doc, {
                startY: 50,
                body: [['Jméno a příjmení:', member.name], ['Bytová jednotka:', member.unitNumber]],
                theme: 'plain',
                styles: { font: 'FiraCode' },
            });

            let yPos = (doc as any).lastAutoTable.finalY + 10;
            doc.setFontSize(10);
            const desc = doc.splitTextToSize(replaceVariables(vote.description, building, variables, vote, member, members), 180);
            doc.text(desc, 14, yPos);
            yPos += desc.length * 4 + 10;
            
            vote.questions.forEach((q, qIndex) => {
                doc.setFontSize(12);
                doc.text(`${qIndex + 1}. ${q.title}`, 14, yPos);
                yPos += 8;
                
                doc.rect(14, yPos, 10, 10); // PRO
                doc.text('PRO', 26, yPos + 7);
                doc.rect(54, yPos, 10, 10); // PROTI
                doc.text('PROTI', 66, yPos + 7);
                doc.rect(94, yPos, 10, 10); // ZDRŽEL/A SE
                doc.text('ZDRŽEL/A SE', 106, yPos + 7);
                yPos += 20;
            });
            
            doc.text('Datum: ..............................', 14, 270);
            doc.text('Podpis: ..............................', 120, 270);
        });

        doc.save(`Hlasovaci_listky_${vote.title.replace(/ /g, '_')}.pdf`);
        addToast('PDF s hlasovacími lístky bylo vygenerováno.', 'success');
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedMembers(e.target.checked ? new Set(members.map(m => m.id)) : new Set());
    };

    const handleSelectMember = (memberId: string) => {
        const newSelection = new Set(selectedMembers);
        newSelection.has(memberId) ? newSelection.delete(memberId) : newSelection.add(memberId);
        setSelectedMembers(newSelection);
    };
    
    const openModal = (type: 'rep' | 'manual', member: Member) => {
        setActiveMember(member);
        if (type === 'rep') setIsRepModalOpen(true);
        if (type === 'manual') setIsManualVoteModalOpen(true);
    };

    const handleSaveRepresentative = (memberId: string, representativeId: string | null) => {
        updateVoteRepresentative(vote.id, memberId, representativeId);
        addToast('Zastoupení bylo pro toto hlasování aktualizováno.', 'success');
    };
    
    const StatusPill = () => {
        const config = VOTE_STATUS_CONFIG[vote.status];
        return (
            <span className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full ${config.className}`}>
                <config.icon className="h-4 w-4" />
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            <PageHeader title={vote.title} onBack={onBack}>
                <Button onClick={handleCopyVote} variant="secondary"><Copy className="w-4 h-4"/> Kopírovat</Button>
                <Button onClick={handleExportBallots} variant="secondary">Exportovat lístky</Button>
                {vote.status === 'draft' && <Button onClick={() => onEdit(vote.id)} variant="secondary"><Edit className="w-4 h-4"/> Upravit</Button>}
                {vote.status === 'draft' && <Button onClick={handleStartVote} variant="success"><PlayCircle className="w-4 h-4"/> Spustit</Button>}
                {vote.status === 'active' && <Button onClick={handleCancelVote} variant="danger"><XCircle className="w-4 h-4"/> Zrušit</Button>}
            </PageHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><h3 className="text-lg font-bold text-gray-900 dark:text-white">Popis</h3></CardHeader>
                        <CardContent><p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{replaceVariables(vote.description, building, variables, vote)}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><h3 className="text-lg font-bold text-gray-900 dark:text-white">Otázky</h3></CardHeader>
                        <CardContent className="space-y-5">
                            {vote.questions.map((q, index) => (
                                <div key={q.id} className="border-b border-gray-200 dark:border-gray-700/50 pb-5 last:border-b-0 last:pb-0">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{index + 1}. {q.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{q.description}</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-500/10 rounded-full inline-block">{getQuestionQuorumInfo(q)}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader><h3 className="text-lg font-bold text-gray-900 dark:text-white">Informace</h3></CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400 font-medium">Stav</span><StatusPill /></div>
                            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400 font-medium">Budova</span><span className="text-gray-800 dark:text-white font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-500" /> {building?.name || 'N/A'}</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400 font-medium">Začátek</span><span className="text-gray-800 dark:text-white font-semibold">{vote.status === 'draft' ? 'Po spuštění' : formatDate(vote.startDate)}</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400 font-medium">Konec</span><span className="text-gray-800 dark:text-white font-semibold">{vote.status === 'draft' ? `~${vote.daysDuration} dní po spuštění` : formatDate(vote.endDate)}</span></div>
                            
                            {vote.attachments.length > 0 && <div className="pt-2 border-t border-gray-200 dark:border-gray-700"><h4 className="text-gray-600 dark:text-gray-400 font-medium mb-2">Přílohy</h4><div className="space-y-2">{vote.attachments.map(att => <a key={att.name} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg"><Paperclip className="w-4 h-4" /><span>{att.name}</span></a>)}</div></div>}
                            {vote.observerEmails.length > 0 && <div className="pt-2 border-t border-gray-200 dark:border-gray-700"><h4 className="text-gray-600 dark:text-gray-400 font-medium mb-2">Pozorovatelé</h4><div className="space-y-2">{vote.observerEmails.map(email => <div key={email} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg"><UserPlus className="w-4 h-4 text-gray-500" /><span>{email}</span></div>)}</div></div>}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Správa Členů a Odesílání</h3>
                        {selectedMembers.size > 0 && <Button onClick={() => handleSendEmails(Array.from(selectedMembers))} variant="primary"><Send className="h-4 h-4" /> Odeslat ({selectedMembers.size})</Button>}
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700/50">
                            <tr>
                                <th className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedMembers.size === members.length && members.length > 0} className="bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500" /></th>
                                <th className="p-4 font-semibold">Člen</th><th className="p-4 font-semibold">Zastoupení</th><th className="p-4 font-semibold">Stav Hlasování</th><th className="p-4 font-semibold">Stav Emailu</th><th className="p-4 font-semibold text-right">Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(member => {
                                const overrideRepId = vote.representativeOverrides[member.id];
                                const effectiveRepId = overrideRepId !== undefined ? overrideRepId : member.representedByMemberId;
                                const representative = members.find(m => m.id === effectiveRepId);
                                const emailLog = vote.emailLog.find(log => log.memberId === member.id);
                                const hasVoted = votedMemberIds.has(member.id);
                                return (
                                <tr key={member.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="p-4"><input type="checkbox" checked={selectedMembers.has(member.id)} onChange={() => handleSelectMember(member.id)} className="bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500" /></td>
                                    <td className="p-4 font-medium">{member.name}<br/><span className="text-xs text-gray-500 dark:text-gray-400">{member.email}</span></td>
                                    <td className="p-4"><span className={`flex items-center gap-1.5 text-xs ${representative ? 'text-purple-600 dark:text-purple-300' : ''}`}><UserCog className="w-4 h-4" />{representative ? `${representative.name} ${overrideRepId !== undefined ? '(Změněno)' : ''}` : 'Nikým'}</span></td>
                                    <td className="p-4">{hasVoted ? <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"><CheckCircle className="w-5 h-5"/> Odhlasováno</span> : <span className="text-sm text-gray-500">Čeká</span>}</td>
                                    <td className="p-4 text-sm">{emailLog ? <div className='text-green-600 dark:text-green-400 flex items-center gap-2'><CheckCircle className="h-4 w-4"/> Odesláno</div> : <span className='text-gray-500 dark:text-gray-400'>Neodesláno</span>}</td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        {vote.status === 'active' && !hasVoted && <Button onClick={() => openModal('manual', member)} variant="secondary" className="px-2 py-1" title="Ručně zadat hlas"><Pencil className="w-4 h-4"/></Button>}
                                        {emailLog && <Button onClick={() => handleSendEmails([member.id])} variant="secondary" className="px-2 py-1" title="Odeslat znovu"><RefreshCw className="w-4 h-4"/></Button>}
                                        <Button onClick={() => openModal('rep', member)} variant="secondary" className="px-2 py-1" title="Změnit zástupce"><UserCog className="w-4 h-4"/></Button>
                                    </td>
                                </tr>);
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {activeMember && (
                <>
                    <ChangeRepresentativeModal isOpen={isRepModalOpen} onClose={() => setIsRepModalOpen(false)} member={activeMember} vote={vote} onSave={handleSaveRepresentative} />
                    <ManualVoteEntryModal isOpen={isManualVoteModalOpen} onClose={() => setIsManualVoteModalOpen(false)} member={activeMember} vote={vote} />
                </>
             )}
        </div>
    );
};