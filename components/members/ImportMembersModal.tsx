import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { Upload } from 'lucide-react';

export const ImportMembersModal = ({ isOpen, onClose, onImport, buildingName }: { isOpen: boolean; onClose: () => void; onImport: (text: string) => void; buildingName?: string; }) => {
    const [text, setText] = useState('');
    const title = `Importovat členy do: ${buildingName || 'vybrané budovy'}`;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
            <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm">Vložte seznam členů. Každý člen na novém řádku ve formátu: <br/><code className="bg-gray-200 dark:bg-gray-900 text-yellow-600 dark:text-yellow-300 p-1 rounded">Jméno;Email;Jednotka;VáhaHlasu;Telefon</code>. Jako oddělovač můžete použít středník, čárku nebo tabulátor. Telefon je nepovinný.</p>
                <Textarea value={text} onChange={e => setText(e.target.value)} rows={10} placeholder={"Jan Novák;jan.novak@email.cz;101;120;123456789\nEva Dvořáková,eva.dvorakova@email.cz,102,110"} />
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Zrušit</Button>
                    <Button onClick={() => onImport(text)}><Upload className="h-4 w-4" /> Importovat</Button>
                </div>
            </div>
        </Modal>
    );
}
