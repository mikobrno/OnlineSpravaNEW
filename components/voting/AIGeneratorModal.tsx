import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../../contexts/ToastContext';
import { Vote, Building } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Wand2, RefreshCw, Copy } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const AIGeneratorModal = ({ vote, building, results, isOpen, onClose }: { 
    vote: Vote; 
    building: Building | undefined; 
    results: any; 
    isOpen: boolean; 
    onClose: () => void; 
}) => {
    const { addToast } = useToast();
    const [report, setReport] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const generateReport = useCallback(async () => {
        if (!vote || !building || !results) return;
        setIsGenerating(true);
        setReport('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const resultsText = results.questionResults.map((q: any) => 
                `Otázka "${q.title}":\n- Výsledek: ${q.passed ? 'SCHVÁLENO' : 'ZAMÍTNUTO'}\n- Hlasy PRO: ${q.results.PRO}\n- Hlasy PROTI: ${q.results.PROTI}\n- Zdrželo se: ${q.results['ZDRŽEL SE']}`
            ).join('\n\n');

            const prompt = `
                Chovej se jako profesionální asistent pro správu SVJ. Tvým úkolem je vygenerovat formální zápis ze shromáždění, které proběhlo formou hlasování per-rollam (online).
                
                Zde jsou data o hlasování:
                - Název SVJ: ${building.data.plny_nazev}
                - Sídlo: ${building.data.adresa}
                - IČO: ${building.data.ico}
                - Název hlasování: ${vote.title}
                - Popis hlasování: ${vote.description}
                - Datum konání (od-do): ${formatDate(vote.startDate)} - ${formatDate(vote.endDate)}

                Výsledky jednotlivých bodů programu (otázek):
                ${resultsText}

                Na základě těchto informací vytvoř profesionálně vypadající a formálně správný zápis ze shromáždění. Struktura by měla být následující:
                1. Hlavička (název SVJ, sídlo, IČO, název dokumentu).
                2. Úvodní odstavec (kdy a jak proběhlo hlasování).
                3. Konstatování o usnášeníschopnosti (na základě výsledků, pokud je to možné odhadnout).
                4. Jednotlivé body programu s jejich plným textem a detailním výsledkem hlasování.
                5. Závěrečné usnesení shrnující, co bylo schváleno.
                6. Závěrečná formální část (datum, místo pro podpisy).

                Použij formální a profesionální jazyk.
            `;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setReport(response.text);
            addToast('Zápis byl úspěšně vygenerován!', 'success');
        } catch (error) {
            console.error("AI report generation error:", error);
            addToast('Při generování zápisu došlo k chybě.', 'error');
        } finally {
            setIsGenerating(false);
        }
    }, [vote, building, results, addToast]);

    useEffect(() => {
        if (isOpen && !report) { // Generate only if modal opens and report is not yet generated
            generateReport();
        }
    }, [isOpen, report, generateReport]);

    const handleCopy = () => {
        navigator.clipboard.writeText(report);
        addToast('Zápis byl zkopírován do schránky.', 'success');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generátor zápisu (AI)" size="3xl">
            {isGenerating && (
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <Wand2 className="w-12 h-12 text-purple-500 animate-pulse" />
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">Generuji zápis ze shromáždění...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Prosím, počkejte. AI analyzuje výsledky hlasování.</p>
                </div>
            )}
            {!isGenerating && report && (
                <div className="space-y-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg max-h-[60vh] overflow-y-auto whitespace-pre-wrap font-serif text-gray-800 dark:text-gray-200">
                        {report}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button onClick={handleCopy} variant="secondary"><Copy className="w-4 h-4"/> Zkopírovat</Button>
                        <Button onClick={generateReport} variant="secondary"><RefreshCw className="w-4 h-4"/> Znovu vygenerovat</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
