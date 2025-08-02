import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Member } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Save } from 'lucide-react';

export const MemberFormModal = ({ isOpen, onClose, onSave, member, buildingName }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (data: Omit<Member, 'id' | 'buildingId'>) => void; 
    member: Member | null;
    buildingName?: string; 
}) => {
    const { members } = useAppContext();
    const getInitialState = () => ({
        name: '', email: '', unitNumber: '', voteWeight: '0', representedByMemberId: '', phone: ''
    });
    const [formData, setFormData] = useState(getInitialState());
    
    useEffect(() => {
        if(isOpen) {
            if(member) {
                setFormData({ 
                    name: member.name, 
                    email: member.email, 
                    unitNumber: member.unitNumber, 
                    voteWeight: String(member.voteWeight),
                    representedByMemberId: member.representedByMemberId || '',
                    phone: member.phone || '',
                });
            } else {
                setFormData(getInitialState());
            }
        }
    }, [member, isOpen]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            name: formData.name,
            email: formData.email,
            unitNumber: formData.unitNumber,
            voteWeight: parseInt(formData.voteWeight) || 0,
            representedByMemberId: formData.representedByMemberId || undefined,
            phone: formData.phone || undefined,
        });
    };
    
    const availableRepresentatives = members.filter(m => m.id !== member?.id);
    const selectClasses = "w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
    const title = member ? 'Upravit člena' : `Přidat člena do: ${buildingName || 'vybrané budovy'}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Celé jméno" required />
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="E-mail" required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input value={formData.unitNumber} onChange={e => setFormData({...formData, unitNumber: e.target.value})} placeholder="Číslo jednotky" required />
                    <Input type="number" value={formData.voteWeight} onChange={e => setFormData({...formData, voteWeight: e.target.value})} placeholder="Váha hlasu" required />
                </div>
                 <Input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Telefon (nepovinné)" />
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zastupován/a členem</label>
                    <select
                        value={formData.representedByMemberId}
                        onChange={e => setFormData({...formData, representedByMemberId: e.target.value})}
                        className={selectClasses}
                    >
                        <option value="">-- Není zastupován/a --</option>
                        {availableRepresentatives.map(rep => (
                            <option key={rep.id} value={rep.id}>{rep.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Zrušit</Button>
                    <Button type="submit"><Save className="h-4 w-4" /> Uložit</Button>
                </div>
            </form>
        </Modal>
    );
}
