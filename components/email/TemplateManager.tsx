import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Card, CardHeader, CardContent } from '../common/Card';

export const TemplateManager = ({ onAdd, onEdit }: { onAdd: () => void; onEdit: (id: string) => void; }) => {
    const { emailTemplates, deleteEmailTemplate } = useAppContext();
    const { addToast } = useToast();

    const handleDelete = (id: string) => {
        if (window.confirm('Opravdu si přejete smazat tuto šablonu?')) {
            deleteEmailTemplate(id);
            addToast('Šablona byla smazána.', 'info');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Správa Šablon</h2>
                <Button onClick={onAdd}><Plus className="w-5 h-5"/> Vytvořit Šablonu</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {emailTemplates.map(t => (
                    <Card key={t.id} className="flex flex-col">
                        <CardHeader><h3 className="font-bold text-gray-900 dark:text-white">{t.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{t.category}</p></CardHeader>
                        <CardContent className="flex-grow"><p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{t.subject}</p></CardContent>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                            <Button onClick={() => onEdit(t.id)} variant="secondary" className="px-2 py-1"><Edit className="w-4 h-4"/></Button>
                            <Button onClick={() => handleDelete(t.id)} variant="danger" className="px-2 py-1"><Trash2 className="w-4 h-4"/></Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
