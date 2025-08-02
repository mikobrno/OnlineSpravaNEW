import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Card } from '../common/Card';
import { Building2, FileText, Variable } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <Card className="flex items-center p-4">
        <div className="p-3 mr-4 text-blue-500 bg-blue-500/10 rounded-full">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </Card>
);

export const AdminDashboard = () => {
    const { buildings, variables, emailTemplates } = useAppContext();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Budovy" value={buildings.length} icon={<Building2 className="w-6 h-6"/>} />
            <StatCard title="Šablony" value={emailTemplates.length} icon={<FileText className="w-6 h-6"/>} />
            <StatCard title="Proměnné" value={variables.length} icon={<Variable className="w-6 h-6"/>} />
        </div>
    );
};
