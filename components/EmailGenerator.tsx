import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Eye, ArrowLeft, ArrowRight, Wand2 } from 'lucide-react';

import { replaceVariables } from '../lib/utils';
import { Button } from './common/Button';
import { Card, CardContent, CardHeader } from './common/Card';


// Simple View for generating emails
export const SimpleGeneratorView = () => {
  const { buildings, emailTemplates, variables, members: buildingMembers, selectedBuilding: contextBuilding } = useAppContext();
  const { addToast } = useToast();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(contextBuilding?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewRecipientIndex, setPreviewRecipientIndex] = useState(0);
  
  useEffect(() => {
    if (contextBuilding) {
        setSelectedBuildingId(contextBuilding.id);
    }
  }, [contextBuilding]);

  const selectedBuilding = useMemo(() => buildings.find(b => b.id === selectedBuildingId) || null, [buildings, selectedBuildingId]);
  const selectedTemplate = useMemo(() => emailTemplates.find(t => t.id === selectedTemplateId) || null, [emailTemplates, selectedTemplateId]);

  const recipientList = useMemo(() => {
      if (!selectedTemplate) return [];
      const category = selectedTemplate.category;
      if (category.includes('Zastupování')) {
          if (selectedTemplate.name.includes('zástupce')) { // Template for representatives
              const representativeIds = new Set(buildingMembers.map(m => m.representedByMemberId).filter(Boolean));
              return buildingMembers.filter(m => representativeIds.has(m.id));
          } else { // Template for represented
              return buildingMembers.filter(m => m.representedByMemberId);
          }
      }
      return buildingMembers; // Default to all members of the selected building
  }, [selectedTemplate, buildingMembers]);

  const currentRecipient = useMemo(() => recipientList[previewRecipientIndex] || null, [recipientList, previewRecipientIndex]);

  useEffect(() => {
      setPreviewRecipientIndex(0);
  }, [selectedTemplateId, selectedBuildingId]);

  const generatedSubject = useMemo(() => {
    if (!selectedTemplate || !selectedBuilding || !currentRecipient) return '';
    return replaceVariables(selectedTemplate.subject, selectedBuilding, variables, null, currentRecipient, buildingMembers);
  }, [selectedTemplate, selectedBuilding, variables, currentRecipient, buildingMembers]);
  
  const generatedBody = useMemo(() => {
    if (!selectedTemplate || !selectedBuilding || !currentRecipient) return '';
    return replaceVariables(selectedTemplate.body, selectedBuilding, variables, null, currentRecipient, buildingMembers);
  }, [selectedTemplate, selectedBuilding, variables, currentRecipient, buildingMembers]);

  const handleSendToGmail = () => {
    if (!generatedSubject || !generatedBody) {
      addToast('Vyberte prosím budovu, šablonu a příjemce.', 'error');
      return;
    }
    console.log('Sending to Gmail (mock):', { to: currentRecipient?.email, subject: generatedSubject, body: generatedBody });
    addToast(`Koncept pro ${currentRecipient?.name} byl odeslán do Gmailu (simulace).`, 'success');
  };
  
  const selectClasses = "w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";


  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">Vygenerovat E-mail</h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Rychle a jednoduše. Vyberte budovu a šablonu pro vygenerování e-mailu.</p>
        </div>
        <Card className="overflow-hidden">
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="building-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">1. Vyberte Budovu</label>
                    <select id="building-select" value={selectedBuildingId} onChange={e => setSelectedBuildingId(e.target.value)} className={selectClasses}>
                        <option value="">-- Zvolte budovu --</option>
                        {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">2. Vyberte Šablonu</label>
                     <select id="template-select" value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} className={selectClasses} disabled={!selectedBuildingId}>
                        <option value="">-- Zvolte šablonu --</option>
                        {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            </CardContent>
        </Card>

        {generatedSubject && generatedBody && currentRecipient && (
            <Card>
                <CardHeader>
                     <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Eye className="h-5 w-5 text-blue-500 dark:text-blue-400" /> Náhled E-mailu</h3>
                        {recipientList.length > 1 && (
                            <div className="flex items-center gap-2">
                                <Button onClick={() => setPreviewRecipientIndex(p => Math.max(0, p - 1))} disabled={previewRecipientIndex === 0} variant="secondary" className="p-2 aspect-square"><ArrowLeft className="w-4 h-4" /></Button>
                                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Příjemce {previewRecipientIndex + 1} / {recipientList.length}</span>
                                <Button onClick={() => setPreviewRecipientIndex(p => Math.min(recipientList.length - 1, p + 1))} disabled={previewRecipientIndex === recipientList.length - 1} variant="secondary" className="p-2 aspect-square"><ArrowRight className="w-4 h-4" /></Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Příjemce</label>
                        <p className="mt-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-md text-gray-800 dark:text-white">{currentRecipient.name} &lt;{currentRecipient.email}&gt;</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Předmět</label>
                        <p className="mt-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-md text-gray-800 dark:text-white font-semibold">{generatedSubject}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Tělo e-mailu</label>
                        <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-md text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">{generatedBody}</div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleSendToGmail} variant="primary">
                            <Wand2 className="h-5 w-5" />
                            Odeslat jako koncept do Gmailu
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
};