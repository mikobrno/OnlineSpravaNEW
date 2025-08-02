import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { GoogleGenAI } from '@google/genai';
import { Eye, Wand2, Save, Expand } from 'lucide-react';

import { PageHeader } from '../common/PageHeader';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { Card, CardContent } from '../common/Card';
import { Modal } from '../common/Modal';
import { replaceVariables } from '../../lib/utils';

export const TemplateEditor = ({ id, onBack }: { id: string | null; onBack: () => void; }) => {
    const { buildings, variables, emailTemplates, addEmailTemplate, updateEmailTemplate } = useAppContext();
    const { addToast } = useToast();
    
    const template = useMemo(() => emailTemplates.find(t => t.id === id) || null, [emailTemplates, id]);
    
    const [name, setName] = useState(template?.name || '');
    const [category, setCategory] = useState(template?.category || 'Informativní');
    const [subject, setSubject] = useState(template?.subject || '');
    const [body, setBody] = useState(template?.body || '');
    const [previewBuildingId, setPreviewBuildingId] = useState(buildings[0]?.id || '');
    const [showAIPrompt, setShowAIPrompt] = useState(false);
    const [aiPrompt, setAIPrompt] = useState('');
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    const globalVariables = useMemo(() => variables.filter(v => v.type === 'global'), [variables]);
    const buildingVariables = useMemo(() => variables.filter(v => v.type === 'building'), [variables]);

    const previewBuilding = useMemo(() => buildings.find(b => b.id === previewBuildingId), [buildings, previewBuildingId]);

    // Create robust dummy data for a full preview experience
    const dummyMemberForPreview = {
        id: 'dummy-member-id',
        name: 'Vážený Vlastník',
        email: 'vlastnik@email.cz',
        unitNumber: '123/A',
        voteWeight: 100,
        buildingId: 'dummy-building-id',
        phone: '123456789'
    };
    const dummyMembersForPreview = [dummyMemberForPreview];
    const dummyVoteForPreview = {
        title: "Ukázka názvu hlasování",
        description: "Toto je ukázkový popis předmětu hlasování, aby bylo vidět, jak se proměnná {{description}} vyplní v textu.",
        memberTokens: { [dummyMemberForPreview.id]: 'UKAZKOVY_UNIKATNI_TOKEN_PRO_NAHLED' }
    };

    const previewSubject = useMemo(() => replaceVariables(subject, previewBuilding || null, variables, dummyVoteForPreview, dummyMemberForPreview, dummyMembersForPreview), [subject, previewBuilding, variables]);
    const previewBody = useMemo(() => replaceVariables(body, previewBuilding || null, variables, dummyVoteForPreview, dummyMemberForPreview, dummyMembersForPreview), [body, previewBuilding, variables]);
    
    const handleGenerateWithAI = async () => {
        if (!aiPrompt.trim() || isAIGenerating) return;
        if (!process.env.API_KEY) {
            addToast('Klíč pro Gemini API nebyl nalezen.', 'error');
            return;
        }
        addToast('Generuji odpověď pomocí AI...', 'info');
        setIsAIGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const allVarKeys = variables.map(v => v.key).concat(['name', 'title', 'description']);
            const systemInstruction = `Jsi asistent pro správu nemovitostí. Tvým úkolem je psát profesionální e-mailové zprávy. Vždy používej formální a zdvořilý tón. Využívej dostupné proměnné v textu tam, kde je to vhodné. Seznam dostupných proměnných je: ${allVarKeys.join(', ')}.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: aiPrompt, config: { systemInstruction, temperature: 0.7 } });
            setBody(response.text);
            addToast('Text byl úspěšně vygenerován!', 'success');
            setShowAIPrompt(false);
        } catch (error) {
            console.error("AI Generation Error:", error);
            addToast('Při generování textu došlo k chybě.', 'error');
        } finally {
            setIsAIGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { name, category, subject, body };
        if (id) {
            await updateEmailTemplate({ ...payload, id });
        } else {
            await addEmailTemplate(payload);
        }
        onBack();
    };
    
    const insertVariable = (variable: string) => {
        const cursorPosition = textareaRef.current?.selectionStart || 0;
        const textBefore = body.substring(0, cursorPosition);
        const textAfter = body.substring(cursorPosition);
        setBody(`${textBefore}{{${variable}}}${textAfter}`);
        textareaRef.current?.focus();
    };
    
    const selectClasses = "bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    const PreviewComponent = () => (
        <>
            <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Předmět</label><p className="mt-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-md text-gray-800 dark:text-white font-semibold">{previewSubject}</p></div>
            <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Tělo e-mailu</label><div className="mt-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-md text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed max-h-[200px] lg:max-h-full overflow-y-auto">{previewBody}</div></div>
        </>
    );

    return (
        <div>
            <PageHeader title={id ? 'Upravit Šablonu' : 'Vytvořit Šablonu'} onBack={onBack} />
             <form onSubmit={handleSubmit} className="space-y-4">
                 <Card>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Název šablony</label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategorie</label><Input value={category} onChange={e => setCategory(e.target.value)} required /></div>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Předmět</label><Input value={subject} onChange={e => setSubject(e.target.value)} required /></div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tělo e-mailu</label>
                                    <button type="button" onClick={() => setShowAIPrompt(!showAIPrompt)} className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/10 rounded-md transition-colors"><Wand2 className="w-4 h-4" />{showAIPrompt ? 'Skrýt AI' : 'Vygenerovat s AI'}</button>
                                </div>
                                {showAIPrompt && (<div className="p-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 space-y-2 animate-fade-in"><label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Zadejte požadavek pro AI</label><Input value={aiPrompt} onChange={e => setAIPrompt(e.target.value)} placeholder="Např. upozornění na odstávku vody..." /><Button type="button" onClick={handleGenerateWithAI} className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-purple-500" disabled={isAIGenerating || !aiPrompt.trim()}>{isAIGenerating ? 'Generuji...' : <><Wand2 className="w-4 h-4" /> Generovat Text</>}</Button></div>)}
                                <Textarea ref={textareaRef} value={body} onChange={e => setBody(e.target.value)} required className="min-h-[250px] font-mono" />
                            </div>
                            <div className="lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dostupné proměnné</label>
                                <div className="p-3 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg max-h-[300px] overflow-y-auto space-y-3">
                                    <div>
                                        <h4 className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Globální</h4>
                                        {globalVariables.map(v => (<button type="button" key={v.id} onClick={() => insertVariable(v.key)} className="w-full text-left p-1 text-sm text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/10 rounded font-mono">&#123;&#123;{v.key}&#125;&#125;</button>))}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 pt-2 border-t border-gray-300 dark:border-gray-600">Z Budovy</h4>
                                        <button type="button" key="name" onClick={() => insertVariable('name')} className="w-full text-left p-1 text-sm text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-500/10 rounded font-mono">&#123;&#123;name&#125;&#125;</button>
                                        {buildingVariables.map(v => (<button type="button" key={v.id} onClick={() => insertVariable(v.key)} className="w-full text-left p-1 text-sm text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-500/10 rounded font-mono">&#123;&#123;{v.key}&#125;&#125;</button>))}
                                    </div>
                                    <div>
                                         <h4 className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider my-2 pt-2 border-t border-gray-200 dark:border-gray-700 first:border-t-0 first:pt-0">Z Hlasování</h4>
                                         <button type="button" onClick={() => insertVariable('title')} className="w-full text-left p-1 text-sm text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/10 rounded font-mono">&#123;&#123;title&#125;&#125;</button>
                                         <button type="button" onClick={() => insertVariable('description')} className="w-full text-left p-1 text-sm text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/10 rounded font-mono">&#123;&#123;description&#125;&#125;</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Eye className="h-5 w-5 text-blue-500 dark:text-blue-400" /> Náhled</h3>
                                <div className='flex items-center gap-2'>
                                    <Button onClick={() => setIsPreviewModalOpen(true)} type="button" variant="secondary" className="px-2 py-1"><Expand className="w-4 h-4"/> Zvětšit</Button>
                                    <select value={previewBuildingId} onChange={e => setPreviewBuildingId(e.target.value)} className={selectClasses}><option value="">-- Bez budovy --</option>{buildings.map(b => <option key={b.id} value={b.id}>Náhled pro: {b.name}</option>)}</select>
                                </div>
                            </div>
                           <div className='space-y-4'>
                             <PreviewComponent />
                           </div>
                        </div>
                    </CardContent>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <Button type="button" onClick={onBack} variant="secondary">Zrušit</Button>
                        <Button type="submit" variant="primary"><Save className="w-4 h-4"/> Uložit šablonu</Button>
                    </div>
                 </Card>
            </form>
            <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title={`Náhled šablony: ${name}`} size="5xl">
                <div className="space-y-4"><PreviewComponent /></div>
            </Modal>
        </div>
    );
};