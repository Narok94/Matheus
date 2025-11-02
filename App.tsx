



import React, { useState, ReactNode, useEffect } from 'react';
import { View, Client, Equipment, Inspection, FinancialRecord, Certificate, ToastMessage, DetailView } from './types';
import { MOCK_CLIENTS, MOCK_EQUIPMENT, MOCK_INSPECTIONS, MOCK_FINANCIAL, MOCK_CERTIFICATES } from './data';
import { Dashboard, Clients, Equipments, Agenda, Certificates, Financial, Settings, ClientDetail, Reports } from './src/components/pages';
import { LoginPage } from './src/components/LoginPage';
import { Toast } from './src/components/common';
import { 
    DashboardIcon, 
    ClientsIcon, 
    EquipmentIcon, 
    AgendaIcon, 
    CertificateIcon, 
    FinancialIcon, 
    SettingsIcon,
    ReportsIcon
} from './src/components/Icons';

type CompanyProfile = { name: string; };
type AppSettings = { notifications: boolean; reminders: boolean; };
type PrefilledInspectionData = {
    clientId?: string;
} | null;


// Custom hook for localStorage persistence
const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(error);
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
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
        <nav className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-border flex justify-around md:hidden z-10">
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
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-accent text-white' : 'text-text-secondary hover:bg-secondary hover:text-text-primary'}`}>
        {icon}
        <span className="ml-3">{label}</span>
    </button>
    );

    return (
        <aside className="hidden md:flex w-64 bg-primary text-white flex-shrink-0 p-4 border-r border-border flex-col">
            <div className="flex items-center mb-8">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
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
    const [isAuthenticated, setIsAuthenticated] = usePersistentState('isAuthenticated', false);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [detailView, setDetailView] = useState<DetailView>(null);
    const [toast, setToast] = useState<ToastMessage>(null);
    const [prefilledInspectionData, setPrefilledInspectionData] = useState<PrefilledInspectionData>(null);


    // App-wide persistent state
    const [theme, setTheme] = usePersistentState<'light' | 'dark'>('theme', 'light');
    const [companyProfile, setCompanyProfile] = usePersistentState<CompanyProfile>('companyProfile', { name: 'Empresa ABC' });
    const [appSettings, setAppSettings] = usePersistentState<AppSettings>('appSettings', { notifications: true, reminders: true });
    
    // Data states
    const [clients, setClients] = usePersistentState<Client[]>('clients', MOCK_CLIENTS);
    const [equipment, setEquipment] = usePersistentState<Equipment[]>('equipment', MOCK_EQUIPMENT);
    const [inspections, setInspections] = usePersistentState<Inspection[]>('inspections', MOCK_INSPECTIONS);
    const [financial, setFinancial] = usePersistentState<FinancialRecord[]>('financial', MOCK_FINANCIAL);
    const [certificates] = usePersistentState<Certificate[]>('certificates', MOCK_CERTIFICATES);
    
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);
    
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ id: Date.now(), message, type });
    };

    // --- Auth Handlers ---
    const handleLogin = (email: string, pass: string) => {
        // Mock authentication
        if (email === 'teste@a.com' && pass === '1234') {
            setIsAuthenticated(true);
            showToast('Login realizado com sucesso!');
        } else {
            showToast('Email ou senha inválidos.', 'error');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
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
        if (detailView?.type === 'client') {
            const client = clients.find(c => c.id === detailView.id);
            if (!client) return <p>Cliente não encontrado</p>;
            return <ClientDetail client={client} equipment={equipment} inspections={inspections} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} onScheduleInspection={handleScheduleForClient} />;
        }

        switch (currentView) {
            case 'dashboard': return <Dashboard clients={clients} equipment={equipment} inspections={inspections} setView={handleSetView} />;
            case 'clients': return <Clients clients={clients} onViewClient={handleViewClient} onAddClient={handleAddClient} />;
            case 'equipment': return <Equipments equipment={equipment} clients={clients} onAddEquipment={handleAddEquipment} />;
            case 'agenda': return <Agenda inspections={inspections} clients={clients} onAddInspection={handleAddInspection} prefilledData={prefilledInspectionData} onPrefillHandled={() => setPrefilledInspectionData(null)} showToast={showToast} />;
            case 'certificates': return <Certificates certificates={certificates} clients={clients}/>;
            case 'reports': return <Reports equipment={equipment} clients={clients} />;
            case 'financial': return <Financial financial={financial} clients={clients} onAddFinancial={handleAddFinancial} />;
            case 'settings': return <Settings 
                theme={theme} 
                setTheme={setTheme}
                profile={companyProfile}
                setProfile={setCompanyProfile}
                settings={appSettings}
                setSettings={setAppSettings}
                showToast={showToast}
                onLogout={handleLogout}
            />;
            default: return <Dashboard clients={clients} equipment={equipment} inspections={inspections} setView={handleSetView} />;
        }
    };

    if (!isAuthenticated) {
        return (
            <>
                <LoginPage onLogin={handleLogin} showToast={showToast} />
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