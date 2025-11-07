import React, { useState, ReactNode, useEffect, useCallback } from 'react';
// FIX: Import ToastMessage to resolve type error.
import { View, DetailView, AgendaAction, ToastMessage, CompanyProfile } from './types';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DataProvider, useData } from './src/context/DataContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { 
    Dashboard, Clients, Equipments, Agenda, Certificates, 
    Financial, Settings, ClientDetail, InspectionDetail, CertificateDetail, Reports, Payables 
} from './src/pages';
import { LoginPage } from './src/components/LoginPage';
import { Toast } from './src/components/common';
import { GlobalLoader } from './src/components/GlobalLoader';
import { 
    DashboardIcon, ClientsIcon, EquipmentIcon, AgendaIcon, 
    CertificateIcon, FinancialIcon, SettingsIcon, ReportsIcon, LogoutIcon
} from './src/components/Icons';
import { useIdleTimer } from './src/hooks/useIdleTimer';


const viewTitles: Record<View, string> = {
    dashboard: 'Início', clients: 'Clientes', equipment: 'Equipamentos',
    agenda: 'Agenda', certificates: 'Certificados', financial: 'Contas a Receber',
    settings: 'Configurações', clientDetail: 'Detalhes do Cliente', 
    inspectionDetail: 'Detalhes da Inspeção/Vistoria', reports: 'Relatórios',
    certificateDetail: 'Certificado', payables: 'Contas a Pagar'
};

const Header: React.FC<{
    view: View;
    onBack: () => void;
    setView: (view: View) => void;
    companyProfile: CompanyProfile;
    onLogout: () => void;
}> = ({ view, onBack, setView, companyProfile, onLogout }) => {

    if (view === 'dashboard') {
        return (
             <header className="p-4 flex items-center justify-between sticky top-0 z-10 bg-secondary/80 backdrop-blur-sm border-b border-border">
                 <div className="flex items-center">
                    <div 
                        className="h-12 w-12 bg-primary/50 rounded-md flex items-center justify-center p-1 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() => setView('settings')}
                    >
                        {companyProfile.logo ? (
                            <img src={companyProfile.logo} alt={`${companyProfile.name} logo`} className="h-full w-full object-contain" />
                        ) : (
                            <div className="text-[9px] leading-tight text-text-secondary">Coloque o Logotipo em configuração</div>
                        )}
                    </div>
                    <h1 className="text-xl font-bold ml-4 text-text-primary">{companyProfile.name}</h1>
                </div>
                 <div className="flex items-center space-x-2">
                    <button onClick={() => setView('settings')} className="text-text-secondary hover:text-accent p-2 rounded-full md:hidden" aria-label="Configurações">
                        <SettingsIcon />
                    </button>
                    <button onClick={onLogout} className="text-text-secondary hover:text-status-reproved p-2 rounded-full" aria-label="Encerrar sessão">
                        <LogoutIcon />
                    </button>
                 </div>
            </header>
        );
    }
    
    return (
        <header className="bg-secondary/80 backdrop-blur-sm border-b border-border p-4 sticky top-0 z-10 md:hidden flex items-center justify-center relative">
            <button onClick={onBack} className="absolute left-4 text-text-primary hover:text-accent transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <h1 className="text-lg font-bold text-text-primary">{viewTitles[view]}</h1>
        </header>
    );
};

const Sidebar = ({ currentView, setView, companyProfile }: { currentView: View, setView: (view: View) => void, companyProfile: CompanyProfile }) => {
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
                <div 
                    className="h-12 w-12 bg-primary/50 rounded-md flex items-center justify-center p-1 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => setView('settings')}
                >
                    {companyProfile.logo ? (
                            <img src={companyProfile.logo} alt={`${companyProfile.name} logo`} className="h-full w-full object-contain" />
                        ) : (
                            <div className="text-[9px] leading-tight text-text-secondary">Coloque o Logotipo em configuração</div>
                        )}
                </div>
                <h1 className="text-xl font-bold ml-4 text-text-primary">{companyProfile.name}</h1>
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

const AppContent: React.FC = () => {
    const { isAuthenticated, isAuthLoading, handleLogout } = useAuth();
    const { isDataLoading } = useData();
    const { theme, companyProfile } = useSettings();

    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [detailView, setDetailView] = useState<DetailView>(null);
    const [toast, setToast] = useState<ToastMessage>(null);
    const [agendaAction, setAgendaAction] = useState<AgendaAction>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ id: Date.now(), message, type });
    }, []);
    
    const handleIdle = useCallback(() => {
        if (isAuthenticated) {
            handleLogout('inactivity', showToast);
        }
    }, [handleLogout, showToast, isAuthenticated]);
    
    useIdleTimer(handleIdle, 15 * 60 * 1000); // 15 minutes
    
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        const body = document.body;
        if (!isAuthenticated) {
            body.classList.add('login-page-active');
        } else {
            body.classList.remove('login-page-active');
        }
    }, [isAuthenticated]);

    const handleSetView = (view: View) => {
        setDetailView(null);
        setCurrentView(view);
    };

    const handleViewClient = (clientId: string) => {
        setDetailView({ type: 'client', id: clientId });
        setCurrentView('clientDetail');
    };

    const handleViewInspection = (inspectionId: string) => {
        setDetailView({ type: 'inspection', id: inspectionId });
        setCurrentView('inspectionDetail');
    };

    const handleViewCertificate = (certificateId: string) => {
        setDetailView({ type: 'certificate', id: certificateId });
        setCurrentView('certificateDetail');
    }

    const handleScheduleForClient = (clientId: string) => {
        setAgendaAction({ action: 'openModal', clientId });
        handleSetView('agenda');
    };
    
    const handleNewInspection = () => {
        setAgendaAction({ action: 'openModal' });
        handleSetView('agenda');
    };
    
    const handleBack = useCallback(() => {
        let previousView: View = 'dashboard'; // Default to dashboard
        if (currentView === 'clientDetail') {
            previousView = 'clients';
        } else if (currentView === 'inspectionDetail') {
            previousView = 'agenda';
        } else if (currentView === 'certificateDetail') {
            previousView = 'certificates';
        }
        setDetailView(null);
        setCurrentView(previousView);
    }, [currentView]);

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <Dashboard setView={handleSetView} onNewInspection={handleNewInspection} />;
            case 'clients': return <Clients onViewClient={handleViewClient} />;
            case 'equipment': return <Equipments showToast={showToast} />;
            case 'agenda': return <Agenda action={agendaAction} onActionHandled={() => setAgendaAction(null)} showToast={showToast} onViewInspection={handleViewInspection} />;
            case 'certificates': return <Certificates onViewCertificate={handleViewCertificate} />;
            case 'reports': return <Reports />;
            case 'financial': return <Financial showToast={showToast} />;
            case 'settings': return <Settings showToast={showToast} />;
            case 'payables': return <Payables showToast={showToast} />;
            case 'clientDetail': 
                if (detailView?.type !== 'client') return <p>Erro: Cliente não especificado.</p>;
                return <ClientDetail clientId={detailView.id} onScheduleInspection={handleScheduleForClient} onViewInspection={handleViewInspection} />;
            case 'inspectionDetail':
                if (detailView?.type !== 'inspection') return <p>Erro: Inspeção não especificada.</p>;
                return <InspectionDetail inspectionId={detailView.id} showToast={showToast} />;
            case 'certificateDetail':
                if (detailView?.type !== 'certificate') return <p>Erro: Certificado não especificado.</p>;
                return <CertificateDetail certificateId={detailView.id} />;
            default: return <Dashboard setView={handleSetView} onNewInspection={handleNewInspection} />;
        }
    };

    if (isAuthLoading || (isAuthenticated && isDataLoading)) {
        return <GlobalLoader />;
    }
    
    if (!isAuthenticated) {
        return (
            <>
                <LoginPage 
                    showToast={showToast}
                />
                <Toast toast={toast} onDismiss={() => setToast(null)} />
            </>
        );
    }

    return (
        <div className="flex h-screen bg-primary">
            <Sidebar currentView={currentView} setView={handleSetView} companyProfile={companyProfile} />
            <div className="flex-1 flex flex-col h-screen min-w-0">
                <Header 
                    view={currentView} 
                    onBack={handleBack} 
                    setView={handleSetView} 
                    companyProfile={companyProfile}
                    onLogout={() => handleLogout('manual', showToast)}
                />
                <main className="flex-1 overflow-y-auto pb-24">
                    {renderView()}
                </main>
                <Toast toast={toast} onDismiss={() => setToast(null)} />
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <SettingsProvider>
                <DataProvider>
                    <AppContent />
                </DataProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;