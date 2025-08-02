import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { PageHeader } from '../common/PageHeader';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { Card, CardContent } from '../common/Card';
import { Save } from 'lucide-react';

export const VariableEditor = ({ id, onBack }: { id: number | null; onBack: () => void; }) => {
    const { variables, addVariable, updateVariable } = useAppContext();
    const { addToast } = useToast();
    
    const variable = useMemo(() => variables.find(v => v.id === id) || null, [variables, id]);

    const [key, setKey] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'global' | 'building'>('building');
    const [value, setValue] = useState('');

    useEffect(() => {
        if (variable) {
            setKey(variable.key);
            setDescription(variable.description);
            setType(variable.type);
            setValue(variable.value || '');
        }
    }, [variable]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { key, description, type, value: type === 'global' ? value : '' };
        if (id !== null) {
            updateVariable({ ...payload, id });
        } else {
            addVariable(payload);
        }
        addToast(id ? 'Proměnná úspěšně aktualizována.' : 'Proměnná úspěšně přidána.', 'success');
        onBack();
    };
    
    const selectClasses = "w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white";

    return (
        <div>
            <PageHeader title={id ? 'Upravit proměnnou' : 'Přidat proměnnou'} onBack={onBack} />
            <form onSubmit={handleSubmit} className="space-y-4">
                <Card>
                    <CardContent className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Klíč (bez složených závorek, např. 'ico')</label><Input value={key} onChange={e => setKey(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Popis (zobrazí se ve formulářích, např. 'IČO')</label><Input value={description} onChange={e => setDescription(e.target.value)} required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ proměnné</label><select value={type} onChange={e => setType(e.target.value as any)} className={selectClasses}><option value="building">Pro budovu</option><option value="global">Globální</option></select></div>
                        {type === 'global' && <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hodnota (pouze pro globální typ)</label><Textarea value={value} onChange={e => setValue(e.target.value)} required={type === 'global'} /></div>}
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