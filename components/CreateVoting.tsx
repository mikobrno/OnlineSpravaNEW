import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { VoteForCreation, VoteType, EmailTemplate } from '../types';
import { Calendar, Clock, Plus, Trash2, Wand2 } from 'lucide-react';

const CreateVoting: React.FC = () => {
  const { selectedBuildingId, buildings, addVote, emailTemplates, variables } = useAppContext();
  const { theme } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    daysDuration: 7,
    type: 'simple' as VoteType,
    customQuorumParticipation: 50,
    customQuorumApproval: 60,
    questions: [{ text: '', choices: ['PRO', 'PROTI', 'ZDRŽEL SE'] }],
    selectedTemplate: '',
    customEmailSubject: '',
    customEmailBody: '',
    useCustomEmail: false
  });

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  // Vypočítání koncového data na základě počtu dní
  const endDate = useMemo(() => {
    if (!formData.startDate || !formData.daysDuration) return 'Vyberte začátek a délku hlasování';
    const start = new Date(formData.startDate);
    const end = new Date(start.getTime() + formData.daysDuration * 24 * 60 * 60 * 1000);
    return end.toLocaleString('cs-CZ', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, [formData.startDate, formData.daysDuration]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'daysDuration' ? parseInt(value, 10) : value 
    }));
  };

  const handleQuestionChange = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? { ...q, text } : q)
    }));
  };

  const handleChoiceChange = (questionIndex: number, choiceIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, choices: q.choices.map((c, ci) => ci === choiceIndex ? value : c) }
          : q
      )
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', choices: ['PRO', 'PROTI', 'ZDRŽEL SE'] }]
    }));
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const addChoice = (questionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, choices: [...q.choices, ''] }
          : q
      )
    }));
  };

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, choices: q.choices.filter((_, ci) => ci !== choiceIndex) }
          : q
      )
    }));
  };

  const generateWithAI = async () => {
    // Placeholder pro AI generování
    alert('AI generování bude implementováno později');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBuildingId) {
      alert('Prosím vyberte dům pro vytvoření hlasování.');
      return;
    }

    if (!formData.title || !formData.startDate || !formData.daysDuration) {
      alert('Prosím vyplňte všechna povinná pole.');
      return;
    }

    const validQuestions = formData.questions.filter(q => 
      q.text.trim() !== '' && q.choices.filter(c => c.trim() !== '').length >= 2
    );

    if (validQuestions.length === 0) {
      alert('Prosím zadejte alespoň jednu otázku s alespoň 2 možnostmi.');
      return;
    }

    try {
      setIsCreating(true);
      
      const voteData: VoteForCreation = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: new Date(new Date(formData.startDate).getTime() + formData.daysDuration * 24 * 60 * 60 * 1000).toISOString(),
        buildingId: selectedBuildingId,
        type: formData.type,
        daysDuration: formData.daysDuration,
        customQuorumParticipation: formData.type === 'custom' ? formData.customQuorumParticipation : undefined,
        customQuorumApproval: formData.type === 'custom' ? formData.customQuorumApproval : undefined,
        questions: validQuestions,
        emailTemplate: formData.useCustomEmail ? undefined : formData.selectedTemplate,
        customEmailSubject: formData.useCustomEmail ? formData.customEmailSubject : undefined,
        customEmailBody: formData.useCustomEmail ? formData.customEmailBody : undefined,
        options: validQuestions[0]?.choices.filter(c => c.trim() !== '') || []
      };

      await addVote(voteData);
      
      // Reset formuláře
      setFormData({
        title: '',
        description: '',
        startDate: '',
        daysDuration: 7,
        type: 'simple',
        customQuorumParticipation: 50,
        customQuorumApproval: 60,
        questions: [{ text: '', choices: ['PRO', 'PROTI', 'ZDRŽEL SE'] }],
        selectedTemplate: '',
        customEmailSubject: '',
        customEmailBody: '',
        useCustomEmail: false
      });

      alert('Hlasování bylo úspěšně vytvořeno!');
    } catch (error: any) {
      console.error('Chyba při vytváření hlasování:', error);
      alert(`Chyba při vytváření hlasování: ${error.message || error}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (!selectedBuildingId) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Vytvoření nového hlasování</h2>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Prosím nejprve vyberte dům v horní části stránky.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Vytvoření nového hlasování
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Dům: <strong className="text-blue-600 dark:text-blue-400">{selectedBuilding?.name}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Základní informace */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Základní informace</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Název hlasování *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Např. Schválení rozpočtu na rok 2024"
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Popis hlasování
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Podrobný popis toho, o čem se hlasuje..."
              rows={3}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Časování */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Časování hlasování</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Začátek hlasování *
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Počet dní hlasování *
              </label>
              <input
                type="number"
                name="daysDuration"
                value={formData.daysDuration}
                onChange={handleInputChange}
                min="1"
                max="30"
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Konec hlasování:</strong> {endDate}
            </p>
          </div>
        </div>

        {/* Typ hlasování */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Typ hlasování</h3>
          
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="simple">Prostá většina (&gt;50% přítomných)</option>
            <option value="qualified">Kvalifikovaná většina (≥75% všech)</option>
            <option value="unanimous">Jednomyslná většina (100% všech)</option>
            <option value="custom">Vlastní kvórum</option>
          </select>

          {formData.type === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimální účast (%)
                </label>
                <input
                  type="number"
                  name="customQuorumParticipation"
                  value={formData.customQuorumParticipation || 50}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimální souhlas (%)
                </label>
                <input
                  type="number"
                  name="customQuorumApproval"
                  value={formData.customQuorumApproval || 60}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Otázky */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Otázky a možnosti</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={generateWithAI}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1 text-sm"
              >
                <Wand2 className="w-4 h-4" />
                AI návrh
              </button>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Přidat otázku
              </button>
            </div>
          </div>

          {formData.questions.map((question, qIndex) => (
            <div key={qIndex} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">Otázka {qIndex + 1}</h4>
                {formData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <input
                type="text"
                value={question.text}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                placeholder="Znění otázky..."
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Možnosti odpovědí
                  </label>
                  <button
                    type="button"
                    onClick={() => addChoice(qIndex)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Přidat možnost
                  </button>
                </div>

                {question.choices.map((choice, cIndex) => (
                  <div key={cIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => handleChoiceChange(qIndex, cIndex, e.target.value)}
                      placeholder={`Možnost ${cIndex + 1}`}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {question.choices.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(qIndex, cIndex)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Email šablony */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email oznámení</h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="emailType"
                checked={!formData.useCustomEmail}
                onChange={() => setFormData(prev => ({ ...prev, useCustomEmail: false }))}
                className="text-blue-600"
              />
              <span className="text-gray-700 dark:text-gray-300">Použít existující šablonu</span>
            </label>

            {!formData.useCustomEmail && (
              <select
                name="selectedTemplate"
                value={formData.selectedTemplate}
                onChange={handleInputChange}
                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Vyberte šablonu...</option>
                {emailTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="emailType"
                checked={formData.useCustomEmail}
                onChange={() => setFormData(prev => ({ ...prev, useCustomEmail: true }))}
                className="text-blue-600"
              />
              <span className="text-gray-700 dark:text-gray-300">Vlastní email</span>
            </label>

            {formData.useCustomEmail && (
              <div className="space-y-3 ml-6">
                <input
                  type="text"
                  name="customEmailSubject"
                  value={formData.customEmailSubject}
                  onChange={handleInputChange}
                  placeholder="Předmět emailu... (můžete použít proměnné)"
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <textarea
                  name="customEmailBody"
                  value={formData.customEmailBody}
                  onChange={handleInputChange}
                  placeholder="Text emailu... (můžete použít proměnné)"
                  rows={4}
                  className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                {/* Dostupné proměnné */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dostupné proměnné:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {variables.map(variable => (
                      <button
                        key={variable.id}
                        type="button"
                        onClick={() => {
                          const variableText = `{{${variable.name}}}`;
                          // Vložit do aktivního pole (předmět nebo tělo)
                          const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
                          if (activeElement && (activeElement.name === 'customEmailSubject' || activeElement.name === 'customEmailBody')) {
                            const start = activeElement.selectionStart || 0;
                            const end = activeElement.selectionEnd || 0;
                            const currentValue = activeElement.value;
                            const newValue = currentValue.slice(0, start) + variableText + currentValue.slice(end);
                            
                            setFormData(prev => ({
                              ...prev,
                              [activeElement.name]: newValue
                            }));
                            
                            // Přesunout kurzor za vloženou proměnnou
                            setTimeout(() => {
                              activeElement.setSelectionRange(start + variableText.length, start + variableText.length);
                              activeElement.focus();
                            }, 0);
                          }
                        }}
                        className="text-left px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                        title={variable.description}
                      >
                        <span className="font-mono">{`{{${variable.name}}}`}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Klikněte na proměnnou pro vložení do aktivního pole. Proměnné se automaticky nahradí skutečnými hodnotami při odesílání emailu.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tlačítka */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isCreating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? 'Vytváří se...' : 'Vytvořit hlasování'}
          </button>
          <button
            type="button"
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors"
          >
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVoting;
