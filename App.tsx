import React, { useState, ReactNode, useEffect, useCallback } from 'react';
// FIX: Import ToastMessage to resolve type error.
import { View, DetailView, PrefilledInspectionData, ToastMessage } from './types';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DataProvider, useData } from './src/context/DataContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { 
    Dashboard, Clients, Equipments, Agenda, Certificates, 
    Financial, Settings, ClientDetail, InspectionDetail, CertificateDetail, Reports 
} from './src/pages';
import { LoginPage, RegisterPage } from './src/components/LoginPage';
import { Toast } from './src/components/common';
import { GlobalLoader } from './src/components/GlobalLoader';
import { 
    DashboardIcon, ClientsIcon, EquipmentIcon, AgendaIcon, 
    CertificateIcon, FinancialIcon, SettingsIcon, ReportsIcon, InspecProLogo
} from './src/components/Icons';
import { useIdleTimer } from './src/hooks/useIdleTimer';


const viewTitles: Record<View, string> = {
    dashboard: 'Início', clients: 'Clientes', equipment: 'Equipamentos',
    agenda: 'Agenda', certificates: 'Certificados', financial: 'Financeiro',
    settings: 'Configurações', clientDetail: 'Detalhes do Cliente', 
    inspectionDetail: 'Detalhes da Inspeção', reports: 'Relatórios',
    certificateDetail: 'Certificado'
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
                    <InspecProLogo className="h-8 w-8 text-slate-800 dark:text-slate-200" />
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
                <InspecProLogo className="h-8 w-8 text-slate-800 dark:text-slate-200" />
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

const AppContent: React.FC = () => {
    const { isAuthenticated, isAuthLoading, handleLogout } = useAuth();
    const { isDataLoading } = useData();
    const { theme } = useSettings();

    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [detailView, setDetailView] = useState<DetailView>(null);
    const [toast, setToast] = useState<ToastMessage>(null);
    const [prefilledInspectionData, setPrefilledInspectionData] = useState<PrefilledInspectionData>(null);

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
        setPrefilledInspectionData({ clientId });
        handleSetView('agenda');
    };
    
    const handleBack = () => {
        let previousView: View = 'dashboard';
        if (currentView === 'clientDetail') previousView = 'clients';
        else if (currentView === 'inspectionDetail') previousView = 'agenda';
        else if (currentView === 'certificateDetail') previousView = 'certificates';
        else if (currentView === 'settings' || currentView === 'reports') previousView = 'dashboard';
        setDetailView(null);
        setCurrentView(previousView);
    };

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <Dashboard setView={handleSetView} />;
            case 'clients': return <Clients onViewClient={handleViewClient} />;
            case 'equipment': return <Equipments showToast={showToast} />;
            case 'agenda': return <Agenda prefilledData={prefilledInspectionData} onPrefillHandled={() => setPrefilledInspectionData(null)} showToast={showToast} onViewInspection={handleViewInspection} />;
            case 'certificates': return <Certificates onViewCertificate={handleViewCertificate} />;
            case 'reports': return <Reports />;
            case 'financial': return <Financial />;
            case 'settings': return <Settings showToast={showToast} />;
            case 'clientDetail': 
                if (detailView?.type !== 'client') return <p>Erro: Cliente não especificado.</p>;
                return <ClientDetail clientId={detailView.id} onScheduleInspection={handleScheduleForClient} onViewInspection={handleViewInspection} />;
            case 'inspectionDetail':
                if (detailView?.type !== 'inspection') return <p>Erro: Inspeção não especificada.</p>;
                return <InspectionDetail inspectionId={detailView.id} showToast={showToast} />;
            case 'certificateDetail':
                if (detailView?.type !== 'certificate') return <p>Erro: Certificado não especificado.</p>;
                return <CertificateDetail certificateId={detailView.id} />;
            default: return <Dashboard setView={handleSetView} />;
        }
    };

    if (isAuthLoading || (isAuthenticated && isDataLoading)) {
        return <GlobalLoader />;
    }
    
    if (!isAuthenticated) {
        return (
            <>
                {authView === 'login' ? (
                    <LoginPage 
                        showToast={showToast}
                        onSwitchToRegister={() => setAuthView('register')}
                    />
                ) : (
                    <RegisterPage 
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