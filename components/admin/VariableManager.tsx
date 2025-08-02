import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

export const VariableManager = ({ onAdd, onEdit }: { onAdd: () => void; onEdit: (id: number) => void; }) => {
    const { variables, deleteVariable } = useAppContext();
    const { addToast } = useToast();

    const handleDelete = (id: number) => {
        if (window.confirm('Opravdu si přejete smazat tuto proměnnou?')) {
            deleteVariable(id);
            addToast('Proměnná byla smazána.', 'info');
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Správa Proměnných</h2>
                <Button onClick={onAdd}><Plus className="w-5 h-5"/> Přidat proměnnou</Button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700/50"><tr><th className="p-4 font-semibold">Klíč</th><th className="p-4 font-semibold">Popis</th><th className="p-4 font-semibold">Typ</th><th className="p-4 font-semibold">Hodnota (pro globální)</th><th className="p-4 font-semibold text-right">Akce</th></tr></thead>
                        <tbody>
                            {variables.map(v => (
                                <tr key={v.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 font-mono text-blue-600 dark:text-blue-300">{`{{${v.key}}}`}</td>
                                    <td className="p-4 text-gray-700 dark:text-gray-300">{v.description}</td>
                                    <td className="p-4 text-gray-700 dark:text-gray-300"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${v.type === 'global' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'}`}>{v.type === 'global' ? 'Globální' : 'Pro budovu'}</span></td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400 line-clamp-1">{v.type === 'global' ? v.value : '-'}</td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <Button onClick={() => onEdit(v.id)} variant="secondary" className="px-2 py-1"><Edit className="w-4 h-4"/></Button>
                                        <Button onClick={() => handleDelete(v.id)} variant="danger" className="px-2 py-1"><Trash2 className="w-4 h-4"/></Button>
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