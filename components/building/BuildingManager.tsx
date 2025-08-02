import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

export const BuildingManager = ({ onAdd, onEdit }: { onAdd: () => void; onEdit: (id: string) => void; }) => {
    const { buildings, deleteBuilding } = useAppContext();
    const { addToast } = useToast();

    const handleDelete = (id: string) => {
        if (window.confirm('Opravdu si přejete smazat tuto budovu?')) {
            deleteBuilding(id);
            addToast('Budova byla smazána.', 'info');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Správa Budov</h2>
                <Button onClick={onAdd}><Plus className="w-5 h-5"/> Přidat Budovu</Button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700/50"><tr><th className="p-4 font-semibold">Název</th><th className="p-4 font-semibold">Počet dat</th><th className="p-4 font-semibold text-right">Akce</th></tr></thead>
                        <tbody>
                            {buildings.map(b => (
                                <tr key={b.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 font-medium">{b.name}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{Object.keys(b.data).length}</td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <Button onClick={() => onEdit(b.id)} variant="secondary" className="px-2 py-1"><Edit className="w-4 h-4"/></Button>
                                        <Button onClick={() => handleDelete(b.id)} variant="danger" className="px-2 py-1"><Trash2 className="w-4 h-4"/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
