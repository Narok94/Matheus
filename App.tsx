

import React, { useState, ReactNode, useEffect, useMemo } from 'react';
import { View, Client, Equipment, Inspection, FinancialRecord, Certificate, ToastMessage, DetailView } from './types';
import { MOCK_CLIENTS, MOCK_EQUIPMENT, MOCK_INSPECTIONS, MOCK_FINANCIAL, MOCK_CERTIFICATES } from './data';
import { Dashboard, Clients, Equipments, Agenda, Certificates, Financial, Settings, ClientDetail, Reports } from './src/components/pages';
import { LoginPage, RegisterPage } from './src/components/LoginPage';
import { Toast } from './src/components/common';
import { 
    DashboardIcon, 
    ClientsIcon, 
    EquipmentIcon, 
    AgendaIcon, 
    CertificateIcon, 
    FinancialIcon, 
    SettingsIcon,
    ReportsIcon,
    InspecProLogo
} from './src/components/Icons';

type CompanyProfile = { name: string; };
type AppSettings = { notifications: boolean; reminders: boolean; };
type PrefilledInspectionData = {
    clientId?: string;
} | null;

export type User = {
    username: string; // stored as lowercase
    passwordHash: string; // plain text for this mock app
    email?: string;
    fullName?: string;
    address?: string;
};


// Custom hook for localStorage persistence, now user-aware by changing the key
const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    });

    // Re-read from localStorage when the key changes (e.g., user logs in/out)
    useEffect(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            setState(storedValue ? JSON.parse(storedValue) : initialValue);
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            setState(initialValue);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    useEffect(() => {
        try {
            // Do not store data for the 'guest' user (when logged out)
            if (key.startsWith('guest-')) {
                return;
            }
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
};

const viewTitles: Record<View, string> = {
    dashboard: 'Início', clients: 'Clientes', equipment: 'Equipamentos',
    agenda: 'Agenda', certificates: 'Certificados', financial: 'Financeiro',
    settings: 'Configurações', clientDetail: 'Detalhes do Cliente', 
    inspectionDetail: 'Detalhes da Inspeção', reports: 'Relatórios'
};


const Header: React.FC<{
    view: View;
    detailView: DetailView;
    onBack: () => void;
    setView: (view: View) => void;
}> = ({ view, detailView, onBack, setView }) => {
    const isDetailView = detailView !== null;
    const isDashboard = view === 'dashboard';

    if (isDashboard) {
        return (
             <header className="p-4 flex items-center justify-between sticky top-0 z-10 bg-secondary/80 backdrop-blur-sm border-b border-border">
                 <div className="flex items-center">
                    <InspecProLogo className="h-8 w-8 text-accent" />
                    <h1 className="text-xl font-bold ml-2 text-text-primary">InspecPro</h1>
                </div>
                 <button onClick={() => setView('settings')} className="text-text-secondary hover:text-accent p-2 rounded-full mr-8">
                    <SettingsIcon />
                 </button>
            </header>
        );
    }
    
    return (
        <header className="bg-secondary/80 backdrop-blur-sm border-b border-border p-4 sticky top-0 z-10 md:hidden flex items-center justify-center">
            {(isDetailView || view === 'settings') && (
                <button onClick={onBack} className="absolute left-4 text-text-primary hover:text-accent transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}
            <h1 className="text-lg font-bold text-text-primary">{viewTitles[view]}</h1>
        </header>
    );
};


const BottomNavLink: React.FC<{ icon: ReactNode, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs font-medium transition-all duration-200 ease-in-out active:scale-90 ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}>
        <div className="relative">
            {icon}
            {isActive && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></span>}
        </div>
        <span className={`mt-1.5 ${isActive ? 'text-text-primary font-semibold' : ''}`}>{label}</span>
    </button>
);

const BottomNav = ({ currentView, setView }: { currentView: View, setView: (view: View) => void }) => {
    const navItems: { view: View, label: string, icon: ReactNode }[] = [
        { view: 'dashboard', label: 'Início', icon: <DashboardIcon /> },
        { view: 'clients', label: 'Clientes', icon: <ClientsIcon /> },
        { view: 'agenda', label: 'Agenda', icon: <AgendaIcon /> },
        { view: 'reports', label: 'Relatórios', icon: <ReportsIcon /> },
        { view: 'financial', label: 'Finanças', icon: <FinancialIcon /> },
    ];
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-secondary/80 backdrop-blur-sm border-t border-border flex justify-around md:hidden z-10">
            {navItems.map(item => (
                <BottomNavLink
                    key={item.view}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentView === item.view}
                    onClick={() => setView(item.view)}
                />
            ))}
        </nav>
    );
};

const Sidebar = ({ currentView, setView }: { currentView: View, setView: (view: View) => void }) => {
    const navItems: { view: View, label: string, icon: ReactNode }[] = [
        { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { view: 'clients', label: 'Clientes', icon: <ClientsIcon /> },
        { view: 'equipment', label: 'Equipamentos', icon: <EquipmentIcon /> },
        { view: 'agenda', label: 'Agenda', icon: <AgendaIcon /> },
        { view: 'certificates', label: 'Certificados', icon: <CertificateIcon /> },
        { view: 'reports', label: 'Relatórios', icon: <ReportsIcon /> },
        { view: 'financial', label: 'Financeiro', icon: <FinancialIcon /> },
    ];
    
    const NavLink: React.FC<{ icon: ReactNode, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-accent text-white' : 'text-text-secondary hover:bg-secondary/50 hover:text-text-primary'}`}>
        {icon}
        <span className="ml-3">{label}</span>
    </button>
    );

    return (
        <aside className="hidden md:flex w-64 bg-primary text-white flex-shrink-0 p-4 border-r border-border flex-col">
            <div className="flex items-center mb-8">
                <InspecProLogo className="h-8 w-8 text-accent" />
                <h1 className="text-xl font-bold ml-2 text-text-primary">InspecPro</h1>
            </div>
            <nav className="flex-grow space-y-2">
                {navItems.map(item => (
                    <NavLink
                        key={item.view}
                        icon={item.icon}
                        label={item.label}
                        isActive={currentView === item.view}
                        onClick={() => setView(item.view)}
                    />
                ))}
            </nav>
            <div className="mt-auto">
                 <NavLink
                    icon={<SettingsIcon />}
                    label="Configurações"
                    isActive={currentView === 'settings'}
                    onClick={() => setView('settings')}
                />
                <footer className="text-center p-2 text-xs text-text-secondary">
                    Produzido por Henrique Costa © 2025
                </footer>
            </div>
        </aside>
    );
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = usePersistentState<string | null>('currentUser', null);
    const isAuthenticated = !!currentUser;
    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [detailView, setDetailView] = useState<DetailView>(null);
    const [toast, setToast] = useState<ToastMessage>(null);
    const [prefilledInspectionData, setPrefilledInspectionData] = useState<PrefilledInspectionData>(null);

    const dataKeyPrefix = useMemo(() => currentUser || 'guest', [currentUser]);

    // Global state (not user-specific)
    const [users, setUsers] = usePersistentState<User[]>('users', [{ username: 'admin', passwordHash: 'admin', fullName: 'Administrador' }]);

    // User-specific states
    const [theme, setTheme] = usePersistentState<'light' | 'dark'>(`${dataKeyPrefix}-theme`, 'dark');
    const [companyProfile, setCompanyProfile] = usePersistentState<CompanyProfile>(`${dataKeyPrefix}-companyProfile`, { name: 'Empresa ABC' });
    const [appSettings, setAppSettings] = usePersistentState<AppSettings>(`${dataKeyPrefix}-appSettings`, { notifications: true, reminders: true });
    
    // User-specific data - new users start with empty arrays, 'admin' gets mock data as a seed.
    const [clients, setClients] = usePersistentState<Client[]>(`${dataKeyPrefix}-clients`, currentUser === 'admin' ? MOCK_CLIENTS : []);
    const [equipment, setEquipment] = usePersistentState<Equipment[]>(`${dataKeyPrefix}-equipment`, currentUser === 'admin' ? MOCK_EQUIPMENT : []);
    const [inspections, setInspections] = usePersistentState<Inspection[]>(`${dataKeyPrefix}-inspections`, currentUser === 'admin' ? MOCK_INSPECTIONS : []);
    const [financial, setFinancial] = usePersistentState<FinancialRecord[]>(`${dataKeyPrefix}-financial`, currentUser === 'admin' ? MOCK_FINANCIAL : []);
    const [certificates] = usePersistentState<Certificate[]>(`${dataKeyPrefix}-certificates`, currentUser === 'admin' ? MOCK_CERTIFICATES : []);


    useEffect(() => {
        // Always set dark theme on login page
        if (!isAuthenticated) {
            document.documentElement.classList.add('dark');
        }
    }, [isAuthenticated]);
    
    useEffect(() => {
        if(isAuthenticated) {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [theme, isAuthenticated]);
    
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ id: Date.now(), message, type });
    };

    // --- Auth Handlers ---
    const handleLogin = (username: string, pass: string) => {
        const user = users.find(u => u.username === username.toLowerCase());
        
        if (user && user.passwordHash === pass) { // Password must match exactly
            setCurrentUser(user.username);
            showToast('Login realizado com sucesso!');
        } else {
            showToast('Credenciais inválidas.', 'error');
        }
    };

    const handleRegister = (username: string, email: string, pass: string, fullName: string, address: string) => {
        const existingUser = users.find(u => u.username === username.toLowerCase());
        if (existingUser) {
            showToast('Este nome de usuário já está em uso.', 'error');
            return;
        }

        const newUser: User = {
            username: username.toLowerCase(),
            passwordHash: pass,
        };
        if (email) newUser.email = email;
        if (fullName) newUser.fullName = fullName;
        if (address) newUser.address = address;


        setUsers(prev => [...prev, newUser]);
        showToast(`Usuário "${username}" registrado com sucesso!`, 'success');
        setAuthView('login');
    };
    
    const handleUpdateUser = (updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(u => u.username === updatedUser.username ? updatedUser : u));
        showToast("Perfil atualizado com sucesso!");
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setAuthView('login');
        showToast('Você saiu da sua conta.');
    };


    // --- CRUD Handlers ---
    const handleAddClient = (clientData: Omit<Client, 'id'>) => {
        const newClient: Client = { ...clientData, id: `cli-${crypto.randomUUID()}` };
        setClients(prev => [...prev, newClient]);
        showToast("Cliente adicionado com sucesso!");
    };
    const handleUpdateClient = (updatedClient: Client) => {
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
        showToast("Cliente atualizado com sucesso!");
    };
    const handleDeleteClient = (clientId: string) => {
        setClients(prev => prev.filter(c => c.id !== clientId));
        // Also remove associated equipment, inspections etc.
        setEquipment(prev => prev.filter(e => e.clientId !== clientId));
        setInspections(prev => prev.filter(i => i.clientId !== clientId));
        setFinancial(prev => prev.filter(f => f.clientId !== clientId));
        setDetailView(null); // Go back to list
        setCurrentView('clients');
        showToast("Cliente e dados associados excluídos!", "error");
    };
    
    const handleAddEquipment = (equipmentData: Omit<Equipment, 'id'>) => {
        const newEquipment: Equipment = { ...equipmentData, id: `eq-${crypto.randomUUID()}` };
        setEquipment(prev => [...prev, newEquipment]);
        showToast("Equipamento adicionado com sucesso!");
    };
    
    const handleAddInspection = (inspectionData: Omit<Inspection, 'id'>) => {
        const newInspection: Inspection = { ...inspectionData, id: `ins-${crypto.randomUUID()}` };
        setInspections(prev => [...prev, newInspection]);
        showToast("Inspeção agendada com sucesso!");
    };
    
    const handleAddFinancial = (recordData: Omit<FinancialRecord, 'id'>) => {
        const newRecord: FinancialRecord = { ...recordData, id: `fin-${crypto.randomUUID()}` };
        setFinancial(prev => [...prev, newRecord]);
        showToast("Registro financeiro salvo!");
    };
    
    // --- View Navigation ---
    const handleSetView = (view: View) => {
        setDetailView(null);
        setCurrentView(view);
    };
    
    const handleViewClient = (clientId: string) => {
        setDetailView({ type: 'client', id: clientId });
        setCurrentView('clientDetail');
    };

    const handleScheduleForClient = (clientId: string) => {
        setPrefilledInspectionData({ clientId });
        handleSetView('agenda');
    };

    const handleBack = () => {
        let previousView: View = 'dashboard';
        if (currentView === 'clientDetail') {
            previousView = 'clients';
        } else if (currentView === 'settings' || currentView === 'reports') {
            previousView = 'dashboard';
        }
        setDetailView(null);
        setCurrentView(previousView);
    };

    const renderView = () => {
        const currentUserDetails = users.find(u => u.username === currentUser);

        if (detailView?.type === 'client') {
            const client = clients.find(c => c.id === detailView.id);
            if (!client) return <p>Cliente não encontrado</p>;
            return <ClientDetail client={client} equipment={equipment} inspections={inspections} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} onScheduleInspection={handleScheduleForClient} />;
        }

        switch (currentView) {
            case 'dashboard': return <Dashboard user={currentUserDetails} clients={clients} equipment={equipment} inspections={inspections} setView={handleSetView} />;
            case 'clients': return <Clients clients={clients} onViewClient={handleViewClient} onAddClient={handleAddClient} />;
            case 'equipment': return <Equipments equipment={equipment} clients={clients} onAddEquipment={handleAddEquipment} />;
            case 'agenda': return <Agenda inspections={inspections} clients={clients} onAddInspection={handleAddInspection} prefilledData={prefilledInspectionData} onPrefillHandled={() => setPrefilledInspectionData(null)} showToast={showToast} />;
            case 'certificates': return <Certificates certificates={certificates} clients={clients}/>;
            case 'reports': return <Reports equipment={equipment} clients={clients} />;
            case 'financial': return <Financial financial={financial} clients={clients} onAddFinancial={handleAddFinancial} />;
            case 'settings': 
                if (!currentUserDetails) return <p>Erro: usuário não encontrado.</p>;
                return <Settings 
                    user={currentUserDetails}
                    onUpdateUser={handleUpdateUser}
                    theme={theme} 
                    setTheme={setTheme}
                    profile={companyProfile}
                    setProfile={setCompanyProfile}
                    settings={appSettings}
                    setSettings={setAppSettings}
                    showToast={showToast}
                    onLogout={handleLogout}
                />;
            default: return <Dashboard user={currentUserDetails} clients={clients} equipment={equipment} inspections={inspections} setView={handleSetView} />;
        }
    };

    if (!isAuthenticated) {
        return (
            <>
                {authView === 'login' ? (
                    <LoginPage 
                        onLogin={handleLogin} 
                        showToast={showToast}
                        onSwitchToRegister={() => setAuthView('register')}
                    />
                ) : (
                    <RegisterPage 
                        onRegister={handleRegister}
                        showToast={showToast}
                        onSwitchToLogin={() => setAuthView('login')}
                    />
                )}
                <Toast toast={toast} onDismiss={() => setToast(null)} />
            </>
        );
    }

    return (
        <div className="flex h-screen bg-primary">
            <Sidebar currentView={currentView} setView={handleSetView} />
            <div className="flex-1 flex flex-col h-screen">
                <Header view={currentView} detailView={detailView} onBack={handleBack} setView={handleSetView} />
                <main className="flex-1 overflow-y-auto pb-24 md:pb-4">
                    {renderView()}
                </main>
                <BottomNav currentView={currentView} setView={handleSetView} />
                <Toast toast={toast} onDismiss={() => setToast(null)} />
            </div>
        </div>
    );
};

export default App;