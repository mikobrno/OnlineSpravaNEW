import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Vote, VoteOption, CastVote } from '../types';
import CreateVoting from './CreateVoting';

interface VotingDashboardProps {}

const VotingDashboard: React.FC<VotingDashboardProps> = () => {
  const { 
    selectedBuildingId, 
    buildings, 
    votes, 
    voteOptions, 
    castVotes, 
    members,
    addVote,
    castVote,
    hasUserVoted,
    getVoteResults,
    sendVoteEmails
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'results'>('list');
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [voteResults, setVoteResults] = useState<any[]>([]);

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  // Načtení výsledků při výběru hlasování
  useEffect(() => {
    if (selectedVote) {
      loadVoteResults(selectedVote.id);
    }
  }, [selectedVote]);

  const loadVoteResults = async (voteId: string) => {
    try {
      const results = await getVoteResults(voteId);
      setVoteResults(results);
    } catch (error) {
      console.error('Chyba při načítání výsledků:', error);
    }
  };

  const handleCastVote = async (voteId: string, optionId: string) => {
    try {
      // V reálné aplikaci bychom získali uživatele z autentizace
      const voterEmail = 'test@example.com';
      const voterName = 'Test User';
      
      await castVote(voteId, optionId, voterEmail, voterName);
      alert('Hlas byl úspěšně odevzdán!');
      
      // Aktualizuj výsledky
      if (selectedVote?.id === voteId) {
        loadVoteResults(voteId);
      }
    } catch (error: any) {
      alert(`Chyba při hlasování: ${error.message}`);
    }
  };

  const handleSendEmails = async (voteId: string) => {
    if (!selectedBuildingId) return;
    
    try {
      const memberIds = members.map(m => m.id);
      await sendVoteEmails(voteId, memberIds);
      alert(`Emaily byly odeslány ${members.length} členům!`);
    } catch (error: any) {
      alert(`Chyba při odesílání emailů: ${error.message}`);
    }
  };

  if (!selectedBuildingId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Hlasovací systém</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Není vybrán žádný dům</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Pro zobrazení hlasování musíte nejprve vybrat dům v horní části stránky.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header s informací o vybraném domě */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Hlasovací systém</h2>
        {selectedBuilding && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800">Vybraný dům</h3>
            <p className="text-sm text-blue-700 mt-1">{selectedBuilding.name}</p>
            <p className="text-xs text-blue-600 mt-1">
              Celkem hlasování: {votes.length} | Aktivní členové: {members.length}
            </p>
          </div>
        )}
      </div>

      {/* Navigační tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Seznam hlasování
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vytvořit hlasování
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Výsledky
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'list' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Aktuální hlasování</h3>
              
              {votes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Pro tento dům zatím nebylo vytvořeno žádné hlasování.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Vytvořit první hlasování
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {votes.map((vote) => (
                    <VoteCard
                      key={vote.id}
                      vote={vote}
                      options={voteOptions[vote.id] || []}
                      votes={castVotes[vote.id] || []}
                      onVote={handleCastVote}
                      onSendEmails={handleSendEmails}
                      onViewResults={() => {
                        setSelectedVote(vote);
                        setActiveTab('results');
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && <CreateVoting />}

          {activeTab === 'results' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Výsledky hlasování</h3>
              
              {!selectedVote ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Vyberte hlasování ze seznamu pro zobrazení výsledků.</p>
                  <button
                    onClick={() => setActiveTab('list')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Zpět na seznam
                  </button>
                </div>
              ) : (
                <VoteResults 
                  vote={selectedVote} 
                  results={voteResults}
                  totalVotes={castVotes[selectedVote.id]?.length || 0}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Komponenta pro zobrazení jednotlivého hlasování
const VoteCard: React.FC<{
  vote: Vote;
  options: VoteOption[];
  votes: CastVote[];
  onVote: (voteId: string, optionId: string) => void;
  onSendEmails: (voteId: string) => void;
  onViewResults: () => void;
}> = ({ vote, options, votes, onVote, onSendEmails, onViewResults }) => {
  const isActive = vote.isActive && new Date(vote.endDate) > new Date();
  const hasEnded = new Date(vote.endDate) <= new Date();

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">{vote.title}</h4>
          {vote.description && (
            <p className="text-gray-600 mt-1">{vote.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>Od: {new Date(vote.startDate).toLocaleString('cs-CZ')}</span>
            <span>Do: {new Date(vote.endDate).toLocaleString('cs-CZ')}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-100 text-green-800' : 
            hasEnded ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isActive ? 'Aktivní' : hasEnded ? 'Ukončeno' : 'Připravuje se'}
          </span>
          <span className="text-xs text-gray-500">
            {votes.length} hlasů
          </span>
        </div>
      </div>

      {options.length > 0 && (
        <div className="space-y-2 mb-4">
          <h5 className="font-medium text-gray-700">Možnosti:</h5>
          {options.map((option) => (
            <div key={option.id} className="flex justify-between items-center">
              <span className="text-gray-600">{option.optionText}</span>
              {isActive && (
                <button
                  onClick={() => onVote(vote.id, option.id)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Hlasovat
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={onViewResults}
          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
        >
          Zobrazit výsledky
        </button>
        <button
          onClick={() => onSendEmails(vote.id)}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          Odeslat emaily
        </button>
      </div>
    </div>
  );
};

// Komponenta pro zobrazení výsledků
const VoteResults: React.FC<{
  vote: Vote;
  results: any[];
  totalVotes: number;
}> = ({ vote, results, totalVotes }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800">{vote.title}</h4>
        <p className="text-sm text-gray-600 mt-1">
          Celkem hlasů: {totalVotes}
        </p>
      </div>

      {results.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Zatím nebyly odevzdány žádné hlasy.</p>
      ) : (
        <div className="space-y-3">
          {results.map((result, index) => {
            const percentage = totalVotes > 0 ? (result.count / totalVotes * 100).toFixed(1) : '0';
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">{result.optionText}</span>
                  <span className="text-sm text-gray-600">
                    {result.count} hlasů ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
                    style={{width: `${percentage}%`}}
                  />
                </div>
                {result.totalWeight && result.totalWeight !== result.count && (
                  <p className="text-xs text-gray-500 mt-1">
                    Vážené hlasy: {result.totalWeight}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VotingDashboard;
