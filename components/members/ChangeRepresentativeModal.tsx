import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Member, Vote } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Save } from 'lucide-react';

export const ChangeRepresentativeModal = ({
    isOpen,
    onClose,
    member,
    vote,
    onSave,
}: {
    isOpen: boolean;
    onClose: () => void;
    member: Member;
    vote: Vote;
    onSave: (memberId: string, representativeId: string | null) => void;
}) => {
    const { members } = useAppContext();
    const effectiveRepId = vote.representativeOverrides[member.id] || member.representedByMemberId || '';
    const [selectedRepId, setSelectedRepId] = useState(effectiveRepId);
    
    const selectClasses = "w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";


    useEffect(() => {
        setSelectedRepId(vote.representativeOverrides[member.id] || member.representedByMemberId || '');
    }, [isOpen, member, vote]);

    const handleSave = () => {
        // If the selected rep is the same as the global one, we can remove the override
        const newRepId = selectedRepId === member.representedByMemberId ? null : selectedRepId || null;
        onSave(member.id, newRepId);
        onClose();
    };

    const availableReps = members.filter(m => m.id !== member.id);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Změnit zástupce pro ${member.name}`} size="lg">
            <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Tato změna platí pouze pro hlasování: <span className="font-semibold text-gray-700 dark:text-gray-300">{vote.title}</span>.</p>
                <select
                    value={selectedRepId}
                    onChange={e => setSelectedRepId(e.target.value)}
                    className={selectClasses}
                >
                    <option value="">-- Není zastupován/a --</option>
                    {availableReps.map(rep => (
                        <option key={rep.id} value={rep.id}>{rep.name}</option>
                    ))}
                </select>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Zrušit</Button>
                    <Button onClick={handleSave}><Save className="h-4 w-4" /> Uložit změnu</Button>
                </div>
            </div>
        </Modal>
    );
};
