import { useState } from 'react';
import { useAppContext } from './contexts/AppContext';
import { useTheme } from './contexts/ThemeContext';
import { SimpleGeneratorView } from './components/EmailGenerator';
import { AdvancedAdminView } from './components/admin/AdvancedAdminView';
import VotingDashboard from './components/VotingDashboard';
import { MembersView } from './components/members/MembersView';
import { Mail, Vote as VoteIcon, SlidersHorizontal, Building, ChevronsUpDown, Check, UserPlus, Sun, Moon } from 'lucide-react';

const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
    );
};

const BuildingSelector = () => {
    const { buildings, selectedBuildingId, setSelectedBuildingId } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    
    const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
    
    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center gap-2 text-gray-800 dark:text-white bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors border border-blue-200 dark:border-blue-700"
            >
                <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-sm">
                    {selectedBuilding ? selectedBuilding.name : 'Vyberte dům'}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </button>
            {isOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                        Vyberte dům
                    </div>
                    <button 
                        onClick={() => {
                            setSelectedBuildingId(null);
                            setIsOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                    >
                        <span>Žádný dům</span>
                        {!selectedBuildingId && <Check className="h-4 w-4 text-green-500" />}
                    </button>
                    {buildings.map((building) => (
                        <button
                            key={building.id}
                            onClick={() => {
                                setSelectedBuildingId(building.id);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                            <span>{building.name}</span>
                            {selectedBuildingId === building.id && <Check className="h-4 w-4 text-green-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const UserSelector = () => {
    const { users, currentUser, setCurrentUserById } = useAppContext();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleUserChange = (userId: string) => {
        setCurrentUserById(userId);
        setIsUserMenuOpen(false);
    };

    const getRoleName = (role: string) => {
        switch(role) {
            case 'admin': return 'Admin';
            case 'member': return 'Člen';
            case 'observer': return 'Pozorovatel';
            default: return 'Uživatel';
        }
    }

    return (
        <div className="relative">
            <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <div className="text-right">
                    <div className="text-sm font-medium">{currentUser?.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{getRoleName(currentUser?.role || '')}</div>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {currentUser?.name?.charAt(0) || 'U'}
                </div>
            </button>

            {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                        Přepnout uživatele
                    </div>
                    {users.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => handleUserChange(user.id)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                            <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{getRoleName(user.role)}</div>
                            </div>
                            {currentUser?.id === user.id && <Check className="h-4 w-4 text-green-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const AppNavigation = ({ appView, setAppView }: { 
    appView: string, 
    setAppView: (view: string) => void
}) => {
    const { currentUser } = useAppContext();

    const NAV_ITEMS = [
        { id: 'hlasovani', name: 'Hlasování', icon: VoteIcon, roles: ['admin', 'member', 'observer'] },
        { id: 'sprava-clenu', name: 'Správa členů', icon: UserPlus, roles: ['admin'] },
        { id: 'emailGenerator', name: 'Email generátor', icon: Mail, roles: ['admin', 'member'] },
        { id: 'administrace', name: 'Administrace', icon: SlidersHorizontal, roles: ['admin'] },
    ];

    const availableItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser!.role));

    return (
        <div className="bg-white/95 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
            <nav className="px-4 sm:px-6 lg:px-8 -mb-px flex items-center space-x-6 overflow-x-auto" aria-label="Tabs">
                {availableItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setAppView(item.id)}
                        className={`${
                            appView === item.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                    </button>
                ))}
            </nav>
        </div>
    );
};

function App() {
    const { currentUser, isLoading } = useAppContext();
    const [appView, setAppView] = useState<'hlasovani' | 'emailGenerator' | 'administrace' | 'sprava-clenu'>('hlasovani');

    const renderContent = () => {
        if (appView === 'hlasovani') {
            return <VotingDashboard />;
        }
        
        if (appView === 'emailGenerator') {
            return <SimpleGeneratorView />;
        }
        
        if (appView === 'administrace') {
            return <AdvancedAdminView />;
        }
        
        if (appView === 'sprava-clenu') {
            return <MembersView />;
        }
        
        return <div className="p-8 text-center"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Funkce se připravuje</h2><p className="text-gray-500 dark:text-gray-400 mt-2">Obsah pro '{appView}' bude brzy dostupný.</p></div>;
    };

    if (isLoading) {
         return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <VoteIcon className="h-16 w-16 text-blue-500 animate-pulse" />
                <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg">Načítání dat z databáze...</p>
            </div>
        );
    }
    
    if (!currentUser) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Nelze načíst uživatele. Zkuste obnovit stránku.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                Online hlasování
                            </h1>
                            <BuildingSelector />
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <ThemeSwitcher />
                            <UserSelector />
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <AppNavigation appView={appView} setAppView={setAppView} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderContent()}
            </main>
        </div>
    );
}

export default App;
