import React, { useState } from 'react';
import { Building2, FileText, Variable, Terminal, BarChart2 } from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { BuildingManager } from '../building/BuildingManager';
import { BuildingEditor } from '../building/BuildingEditor';
import { TemplateManager } from '../email/TemplateManager';
import { TemplateEditor } from '../email/TemplateEditor';
import { VariableManager } from './VariableManager';
import { VariableEditor } from './VariableEditor';
import { Card, CardContent } from '../common/Card';

const TABS = [
  { id: 'dashboard', name: 'Přehled', icon: BarChart2 },
  { id: 'buildings', name: 'Budovy', icon: Building2 },
  { id: 'templates', name: 'Šablony', icon: FileText },
  { id: 'variables', name: 'Proměnné', icon: Variable },
  { id: 'console', name: 'Konzole', icon: Terminal },
];

type AdminViewType = {
    type: 'dashboard' | 'buildings' | 'templates' | 'variables' | 'console';
    mode: 'list' | 'edit' | 'new';
    id: string | number | null;
}

const CommandConsole = () => {
    // This component is a placeholder for a future command console feature.
    return (
        <Card>
            <CardContent>
                <span className='text-gray-600 dark:text-gray-400'>Konzole se připravuje...</span>
            </CardContent>
        </Card>
    );
};

export const AdvancedAdminView = () => {
    const [view, setView] = useState<AdminViewType>({ type: 'dashboard', mode: 'list', id: null });

    const handleBack = () => setView(prev => ({ ...prev, mode: 'list', id: null }));

    const renderListView = () => {
        const ActiveListComponent = {
            dashboard: AdminDashboard,
            buildings: () => <BuildingManager onAdd={() => setView({ type: 'buildings', mode: 'new', id: null})} onEdit={(id) => setView({ type: 'buildings', mode: 'edit', id })} />,
            templates: () => <TemplateManager onAdd={() => setView({ type: 'templates', mode: 'new', id: null})} onEdit={(id) => setView({ type: 'templates', mode: 'edit', id })} />,
            variables: () => <VariableManager onAdd={() => setView({ type: 'variables', mode: 'new', id: null})} onEdit={(id) => setView({ type: 'variables', mode: 'edit', id })} />,
            console: CommandConsole,
        }[view.type];
        return <ActiveListComponent />;
    };

    const renderEditView = () => {
        switch(view.type) {
            case 'buildings': return <BuildingEditor id={view.id as string | null} onBack={handleBack} />;
            case 'templates': return <TemplateEditor id={view.id as string | null} onBack={handleBack} />;
            case 'variables': return <VariableEditor id={view.id as number | null} onBack={handleBack} />;
            default: return renderListView(); // Fallback
        }
    };
    
    return (
        <div className="space-y-8">
             {(view.mode === 'list') ? (
                <>
                    <div className="text-left">
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">Administrace</h1>
                        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Správa budov, e-mailových šablon a globálních proměnných.</p>
                    </div>
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto">
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={() => setView({ type: tab.id as any, mode: 'list', id: null })} className={`${view.type === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}>
                                    <tab.icon className="h-5 w-5" />{tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div>{renderListView()}</div>
                </>
            ) : (
                renderEditView()
            )}
        </div>
    );
};