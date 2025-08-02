import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { Question, VoteForCreation, Vote } from '../../types';
import { Save, Plus, Trash2, Eye } from 'lucide-react';

import { PageHeader } from '../common/PageHeader';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Card, CardContent, CardHeader } from '../common/Card';
import { Modal } from '../common/Modal';
import { VOTE_TYPE_CONFIG } from '../common/Pills';
import { formatDate, replaceVariables } from '../../lib/utils';

export const VoteFormView = ({ voteIdToEdit, onFinish }: { 
    voteIdToEdit?: string | null, 
    onFinish: () => void 
}) => {
    const { votes, addVote, updateVote, selectedBuilding, variables, emailTemplates, members } = useAppContext();
    const { addToast } = useToast();
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    
    const voteToEdit = useMemo(() => votes.find(v => v.id === voteIdToEdit), [votes, voteIdToEdit]);
    const isEditMode = !!voteToEdit;
    
    const emptyQuestion: Omit<Question, 'id'> = { title: '', description: '', voteType: 'simple' };
    const getTodayString = () => new Date().toISOString().split('T')[0];
    
    const getInitialFormData = useCallback(() => {
        if (isEditMode && voteToEdit) {
            return {
                title: voteToEdit.title,
                description: voteToEdit.description,
                attachments: voteToEdit.attachments,
                questions: voteToEdit.questions,
                observerEmails: voteToEdit.observerEmails || [],
                startDate: new Date(voteToEdit.startDate).toISOString().split('T')[0],
                daysDuration: voteToEdit.daysDuration,
            };
        }
        return {
            title: '', description: '', attachments: [],
            questions: [emptyQuestion] as (Omit<Question, 'id'> | Question)[],
            observerEmails: [] as string[], startDate: getTodayString(), daysDuration: 7,
        };
    }, [isEditMode, voteToEdit]);

    const [formData, setFormData] = useState(getInitialFormData());
    
    useEffect(() => {
        setFormData(getInitialFormData());
    }, [voteIdToEdit, getInitialFormData]);
    
    const calculatedEndDate = useMemo(() => {
        if (!formData.startDate || !formData.daysDuration) return 'N/A';
        const start = new Date(formData.startDate);
        const end = new Date(start.getTime() + formData.daysDuration * 24 * 60 * 60 * 1000);
        return formatDate(end.toISOString()).split(',')[0];
    }, [formData.startDate, formData.daysDuration]);
    
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const selectedTemplate = useMemo(() => emailTemplates.find(t => t.id === selectedTemplateId), [emailTemplates, selectedTemplateId]);

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId);
        const template = emailTemplates.find(t => t.id === templateId);

        if (template) {
            const signatureKey = '{{podpis_spravce}}';
            let newDescription = template.body;
            const signatureIndex = newDescription.indexOf(signatureKey);
            if (signatureIndex !== -1) newDescription = newDescription.substring(0, signatureIndex).trim();

            const newTitle = replaceVariables(template.subject, selectedBuilding, variables, {title: '', description: ''});
            const processedDescription = replaceVariables(newDescription, selectedBuilding, variables, {title: '', description: ''});

            setFormData(prev => ({ ...prev, title: newTitle, description: processedDescription }));
            addToast('Název a popis byly vyplněny dle šablony.', 'success');
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'daysDuration' ? parseInt(value, 10) : value }));
    };
    
    const handleObserverEmailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, observerEmails: e.target.value.split(';').map(email => email.trim()).filter(Boolean) }));
    }

    const handleQuestionChange = (index: number, field: string, value: any) => {
        const newQuestions = [...formData.questions];
        const question = { ...newQuestions[index], [field]: value };
        if(field === 'voteType' && value !== 'custom') {
            delete (question as Question).customQuorumNumerator;
            delete (question as Question).customQuorumDenominator;
        }
        newQuestions[index] = question;
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };
    
    const addQuestion = () => setFormData(prev => ({ ...prev, questions: [...prev.questions, emptyQuestion]}));
    const removeQuestion = (index: number) => {
        if(formData.questions.length > 1) setFormData(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && voteToEdit) {
            const updatedVote: Vote = { ...voteToEdit, ...formData, questions: formData.questions as Question[],
                endDate: new Date(new Date(formData.startDate).getTime() + formData.daysDuration * 24 * 60 * 60 * 1000).toISOString(),
            };
            updateVote(updatedVote);
            addToast('Návrh hlasování byl upraven.', 'success');
        } else {
            const voteForCreation: Omit<VoteForCreation, 'buildingId'> = { ...formData,
                questions: formData.questions as (Omit<Question, 'id'> & { customQuorumNumerator?: number, customQuorumDenominator?: number })[],
                startDate: new Date(formData.startDate).toISOString(),
            };
            addVote(voteForCreation);
            addToast('Návrh hlasování byl vytvořen.', 'success');
        }
        onFinish();
    };
    
    const insertVariable = (variableKey: string) => {
        if (!descriptionRef.current) return;
        const { selectionStart, selectionEnd, value } = descriptionRef.current;
        const newText = `${value.substring(0, selectionStart)}{{${variableKey}}}${value.substring(selectionEnd)}`;
        setFormData(prev => ({ ...prev, description: newText }));
        setTimeout(() => descriptionRef.current?.focus(), 0);
    };

    const selectClasses = "w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

    const previewVoteForTemplate = useMemo(() => {
        return {
            title: formData.title,
            description: formData.description,
            memberTokens: members.reduce((acc, member) => {
                acc[member.id] = `nahled_tokenu_${member.id}`;
                return acc;
            }, {} as Record<string, string>)
        };
    }, [formData.title, formData.description, members]);

    const previewSubject = useMemo(() => {
        if (!selectedTemplate) return '';
        const previewRecipient = members.length > 0 ? members[0] : null;
        return replaceVariables(selectedTemplate.subject, selectedBuilding, variables, previewVoteForTemplate, previewRecipient, members);
    }, [selectedTemplate, selectedBuilding, variables, previewVoteForTemplate, members]);

    const previewBody = useMemo(() => {
        if (!selectedTemplate) return '';
        const previewRecipient = members.length > 0 ? members[0] : null;
        return replaceVariables(selectedTemplate.body, selectedBuilding, variables, previewVoteForTemplate, previewRecipient, members);
    }, [selectedTemplate, selectedBuilding, variables, previewVoteForTemplate, members]);
    
    const TemplatePreviewComponent = () => (
         <div className="space-y-2">
            <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Předmět</label><p className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded-md text-gray-800 dark:text-white font-semibold text-sm">{previewSubject}</p></div>
            <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Tělo e-mailu</label><div className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded-md text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-[150px] overflow-y-auto">{previewBody}</div></div>
        </div>
    );
    
    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <PageHeader title={isEditMode ? 'Upravit hlasování' : 'Nové hlasování'} onBack={onFinish} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader><h3 className="text-lg font-bold text-gray-900 dark:text-white">Základní informace pro: <span className="text-blue-500 dark:text-blue-400">{selectedBuilding?.name}</span></h3></CardHeader>
                        <CardContent className="space-y-4">
                            <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="Název hlasování" required />
                            <Textarea ref={descriptionRef} name="description" value={formData.description} onChange={handleInputChange} placeholder="Podrobný popis předmětu hlasování..." required />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Datum zahájení</label><Input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Doba trvání (dny)</label><Input type="number" name="daysDuration" value={formData.daysDuration} onChange={handleInputChange} min="1" max="30" required /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Předpokládaný konec</label><div className="h-10 px-3 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center text-gray-600 dark:text-gray-300">{calculatedEndDate}</div></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-maily pozorovatelů (oddělené středníkem)</label><Input name="observerEmails" value={formData.observerEmails.join('; ')} onChange={handleObserverEmailsChange} placeholder="observer@email.com" /></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><h3 className="text-lg font-bold text-gray-900 dark:text-white">Otázky</h3></CardHeader>
                        <CardContent className="space-y-6">
                            {formData.questions.map((q, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4 relative">
                                    {formData.questions.length > 1 && <button type="button" onClick={() => removeQuestion(index)} className="absolute top-2 right-2 p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"><Trash2 className="h-4 w-4" /></button>}
                                    <Input value={q.title} onChange={e => handleQuestionChange(index, 'title', e.target.value)} placeholder={`Název otázky č. ${index + 1}`} required />
                                    <Textarea value={q.description} onChange={e => handleQuestionChange(index, 'description', e.target.value)} placeholder="Popis otázky" required />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <select value={q.voteType} onChange={e => handleQuestionChange(index, 'voteType', e.target.value)} className={selectClasses}>
                                            {Object.entries(VOTE_TYPE_CONFIG).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                                            <option value="custom">Vlastní kvórum</option>
                                        </select>
                                        {q.voteType === 'custom' && (<div className="flex items-center gap-2"><Input type="number" value={(q as Question).customQuorumNumerator || ''} onChange={e => handleQuestionChange(index, 'customQuorumNumerator', parseInt(e.target.value) || undefined)} placeholder="Čitatel" required /><span className="text-xl text-gray-500">/</span><Input type="number" value={(q as Question).customQuorumDenominator || ''} onChange={e => handleQuestionChange(index, 'customQuorumDenominator', parseInt(e.target.value) || undefined)} placeholder="Jmenovatel" required /></div>)}
                                    </div>
                                </div>
                            ))}
                            <Button type="button" onClick={addQuestion} variant="secondary"><Plus className="h-4 w-4" />Přidat další otázku</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader><h3 className="text-lg font-bold text-gray-900 dark:text-white">Dostupné proměnné</h3></CardHeader>
                        <CardContent className="space-y-2 max-h-[250px] overflow-y-auto">
                            {Object.entries({'Globální': 'global', 'Z Budovy': 'building', 'Z Hlasování': ['title', 'description']}).map(([label, type]) => (<div key={label}><h4 className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider my-2 pt-2 border-t border-gray-200 dark:border-gray-700 first:border-t-0 first:pt-0">{label}</h4>{Array.isArray(type) ? type.map(v => <button type="button" key={v} onClick={() => insertVariable(v)} className="w-full text-left p-1 text-sm text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/10 rounded font-mono">&#123;&#123;{v}&#125;&#125;</button>) : variables.filter(v => v.type === type).map(v => (<button type="button" key={v.id} onClick={() => insertVariable(v.key)} className={`w-full text-left p-1 text-sm ${type === 'global' ? 'text-blue-600 dark:text-blue-300' : 'text-green-600 dark:text-green-300'} hover:bg-opacity-50 rounded font-mono`}>&#123;&#123;{v.key}&#125;&#125;</button>))}</div>))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><div className="flex justify-between items-center"><h3 className="text-lg font-bold text-gray-900 dark:text-white">Načíst ze šablony</h3>{selectedTemplate && (<Button onClick={(e) => { e.preventDefault(); setIsPreviewModalOpen(true); }} variant="secondary" className="px-2 py-1" title="Zobrazit náhled"><Eye className="w-4 h-4"/></Button>)}</div></CardHeader>
                        <CardContent className="space-y-2">
                            <select value={selectedTemplateId} onChange={e => handleTemplateChange(e.target.value)} className={selectClasses}><option value="">-- Vyberte šablonu --</option>{emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                            {selectedTemplate && <div className="mt-4"><TemplatePreviewComponent /></div>}
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" onClick={onFinish} variant="secondary">Zrušit</Button>
                <Button type="submit" variant="primary" className="px-8 py-3 text-base"><Save className="h-5 w-5"/>{isEditMode ? 'Uložit změny' : 'Uložit jako návrh'}</Button>
            </div>

            <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title={`Náhled šablony: ${selectedTemplate?.name || ''}`} size="5xl">
                <div className="space-y-4">{selectedTemplate ? <TemplatePreviewComponent /> : <p>Nejprve vyberte šablonu.</p>}</div>
            </Modal>
        </form>
    );
};