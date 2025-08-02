import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { Member } from '../../types';
import { Plus, Trash2, Edit, Upload, UserCog } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { MemberFormModal } from './MemberFormModal';
import { ImportMembersModal } from './ImportMembersModal';

export const MembersView = () => {
    const { members, addMember, updateMember, deleteMember, addMultipleMembers, selectedBuilding } = useAppContext();
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    const handleOpenModal = (member: Member | null = null) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingMember(null);
        setIsModalOpen(false);
    };

    const handleSaveMember = (memberData: Omit<Member, 'id' | 'buildingId'>) => {
        if (editingMember) {
            updateMember({ ...memberData, id: editingMember.id, buildingId: editingMember.buildingId });
            addToast('Člen byl úspěšně aktualizován.', 'success');
        } else {
            addMember(memberData);
            addToast('Člen byl úspěšně přidán.', 'success');
        }
        handleCloseModal();
    };
    
    const handleDeleteMember = (id: string) => {
        if(window.confirm('Opravdu chcete smazat tohoto člena?')) {
            deleteMember(id);
            addToast('Člen byl smazán.', 'info');
        }
    }
    
    const handleImport = (text: string) => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const newMembers: Omit<Member, 'id' | 'buildingId'>[] = lines.map(line => {
            const [name, email, unitNumber, voteWeight, phone] = line.split(/[;,	]/).map(s => s.trim());
            return { name, email, unitNumber, voteWeight: parseInt(voteWeight) || 0, phone };
        }).filter(m => m.name && m.email && m.unitNumber && m.voteWeight > 0);
        
        if (newMembers.length > 0) {
            const count = addMultipleMembers(newMembers);
            addToast(`${count} z ${newMembers.length} nových členů bylo úspěšně importováno. Duplicitní emaily byly přeskočeny.`, 'success');
            setIsImportModalOpen(false);
        } else {
            addToast('Nenalezeny žádné validní záznamy k importu. Ujistěte se, že formát je: Jméno,Email,Jednotka,VáhaHlasu', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title={`Správa členů: ${selectedBuilding?.name}`}>
                 <div className="flex gap-2">
                    <Button onClick={() => setIsImportModalOpen(true)} variant="secondary"><Upload className="h-5 w-5"/> Importovat</Button>
                    <Button onClick={() => handleOpenModal(null)}><Plus className="h-5 w-5"/> Přidat člena</Button>
                </div>
            </PageHeader>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700/50"><tr><th className="p-4 font-semibold">Jméno</th><th className="p-4 font-semibold">Email / Telefon</th><th className="p-4 font-semibold">Jednotka</th><th className="p-4 font-semibold">Váha hlasu</th><th className="p-4 font-semibold">Zastupován kým</th><th className="p-4 font-semibold text-right">Akce</th></tr></thead>
                        <tbody>
                            {members.map(m => {
                                const representative = m.representedByMemberId ? members.find(rep => rep.id === m.representedByMemberId) : null;
                                return (
                                <tr key={m.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 font-medium">{m.name}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                                        <div>{m.email}</div>
                                        <div className="text-xs text-gray-500">{m.phone}</div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{m.unitNumber}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{m.voteWeight}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{representative ? (<span className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-300"><UserCog className="w-4 h-4" />{representative.name}</span>) : 'Nikým'}</td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <Button onClick={() => handleOpenModal(m)} variant="secondary" className="px-2 py-1"><Edit className="w-4 h-4"/></Button>
                                        <Button onClick={() => handleDeleteMember(m.id)} variant="danger" className="px-2 py-1"><Trash2 className="w-4 h-4"/></Button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </Card>
            <MemberFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveMember} member={editingMember} buildingName={selectedBuilding?.name} />
            <ImportMembersModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImport} buildingName={selectedBuilding?.name} />
        </div>
    );
};
