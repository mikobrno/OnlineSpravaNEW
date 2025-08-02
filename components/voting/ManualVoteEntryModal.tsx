import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { Member, Vote, VoteChoice } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Save } from 'lucide-react';

export const ManualVoteEntryModal = ({
    isOpen,
    onClose,
    member,
    vote,
}: {
    isOpen: boolean;
    onClose: () => void;
    member: Member;
    vote: Vote;
}) => {
    const { submitManualVote, profile } = useAppContext();
    const { addToast } = useToast();
    const [choices, setChoices] = useState<Record<string, VoteChoice>>({});

    const handleChoiceChange = (questionId: string, choice: VoteChoice) => {
        setChoices(prev => ({...prev, [questionId]: choice}));
    };
    
    const isFormComplete = vote.questions.length === Object.keys(choices).length;

    const handleSave = () => {
        if (!isFormComplete || !profile) {
            addToast('Musíte vyplnit volbu pro všechny otázky.', 'error');
            return;
        }

        const formattedChoices = Object.entries(choices).map(([questionId, choice]) => ({
            questionId,
            choice,
        }));

        try {
            submitManualVote(vote.id, member.id, profile.id, formattedChoices);
            addToast(`Hlas pro člena ${member.name} byl úspěšně ručně zadán.`, 'success');
            onClose();
        } catch (error: any) {
            addToast(error.message, 'error');
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ruční zadání hlasu pro: ${member.name}`} size="2xl">
            <div className="space-y-6">
                {vote.questions.map((q, index) => (
                    <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{index + 1}. {q.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">{q.description}</p>
                        <div className="flex gap-3">
                            {(['PRO', 'PROTI', 'ZDRŽEL SE'] as VoteChoice[]).map(choice => (
                                <button
                                    key={choice}
                                    onClick={() => handleChoiceChange(q.id, choice)}
                                    className={`px-4 py-2 rounded-md font-semibold text-sm w-full transition-colors ${
                                        choices[q.id] === choice
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                                    }`}
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose}>Zrušit</Button>
                    <Button onClick={handleSave} disabled={!isFormComplete}><Save className="h-4 w-4" /> Uložit hlas</Button>
                </div>
            </div>
        </Modal>
    );
};