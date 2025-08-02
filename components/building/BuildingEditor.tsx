import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { PageHeader } from '../common/PageHeader';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Card, CardContent } from '../common/Card';
import { Save } from 'lucide-react';

export const BuildingEditor = ({ id, onBack }: { id: string | null; onBack: () => void; }) => {
    const { buildings, variables, addBuilding, updateBuilding } = useAppContext();
    const { addToast } = useToast();
    
    const building = useMemo(() => buildings.find(b => b.id === id) || null, [buildings, id]);
    const buildingVariables = useMemo(() => variables.filter(v => v.type === 'building'), [variables]);
    
    const [name, setName] = useState(building?.name || '');
    const [data, setData] = useState<Record<string, string>>(building?.data || {});

    const handleDataChange = (key: string, value: string) => {
        setData(prev => ({...prev, [key]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            addToast('Název budovy je povinný.', 'error');
            return;
        }
        const payload = { name, data };
        if (id && building) {
            updateBuilding({ ...building, ...payload });
            addToast('Budova úspěšně aktualizována.', 'success');
        } else {
            addBuilding(payload);
            addToast('Budova úspěšně přidána.', 'success');
        }
        onBack();
    };

    return (
        <div>
            <PageHeader title={id ? 'Upravit Budovu' : 'Přidat Budovu'} onBack={onBack} />
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Název budovy</label>
                            <Input value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data budovy</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {buildingVariables.map(v => (
                                    <div key={v.id}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{v.description}</label>
                                        <Input value={data[v.key] || ''} onChange={e => handleDataChange(v.key, e.target.value)} placeholder={v.description} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <Button type="button" onClick={onBack} variant="secondary">Zrušit</Button>
                        <Button type="submit" variant="primary"><Save className="w-4 h-4"/> Uložit</Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};