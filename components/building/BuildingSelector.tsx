import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Vote as VoteIcon, Building2, ArrowRight } from 'lucide-react';

export const BuildingSelector = () => {
    const { buildings, selectBuilding } = useAppContext();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="text-center mb-12">
                <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                    <VoteIcon className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">Vítejte v OnlineSprava</h1>
                <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">Prosím, vyberte budovu, se kterou chcete pracovat.</p>
            </div>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buildings.map(building => (
                    <button 
                        key={building.id} 
                        onClick={() => selectBuilding(building)}
                        className="group text-left p-6 bg-white dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:border-blue-500 hover:shadow-blue-500/20 transform hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start">
                             <div>
                                <Building2 className="h-8 w-8 text-blue-500 dark:text-blue-400 mb-3" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{building.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{building.data.adresa}</p>
                            </div>
                            <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </button>
                ))}
            </div>
             <footer className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                Nemůžete najít svou budovu? Kontaktujte administrátora.
            </footer>
        </div>
    );
};