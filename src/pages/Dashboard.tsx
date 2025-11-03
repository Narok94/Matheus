import { ReactNode } from 'react';
import { View, InspectionStatus } from '../../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/common';
import { ClientsIcon, ReportsIcon, PlusIcon, EquipmentIcon } from '../components/Icons';

export const Dashboard = ({ setView }: { setView: (view: View) => void }) => {
  const { currentUserDetails } = useAuth();
  const { clients, equipment, inspections } = useData();

  const upcomingInspections = inspections.filter(i => new Date(i.date) > new Date() && i.status === InspectionStatus.Agendada).slice(0, 3);
  const expiringEquipment = equipment.filter(e => new Date(e.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 3))).slice(0, 3);

  const getFirstName = (fullName?: string) => {
    if (!fullName || fullName.trim() === '') return '';
    return fullName.split(' ')[0];
  };

  const firstName = getFirstName(currentUserDetails?.fullName);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Bom dia, ${firstName}!`;
    if (hour < 18) return `Boa tarde, ${firstName}!`;
    return `Boa noite, ${firstName}!`;
  };

  const greeting = firstName ? getGreeting() : 'Olá!';

  const QuickActionButton = ({ label, icon, onClick }: { label: string, icon: ReactNode, onClick: () => void }) => (
      <button onClick={onClick} className="bg-secondary/70 dark:bg-secondary/70 backdrop-blur-md p-4 rounded-xl text-text-primary flex flex-col items-center justify-center text-center hover:border-accent transition-colors shadow-lg dark:shadow-cyan-900/10 border border-border space-y-2 transform active:scale-95">
        <div className="text-accent text-2xl">{icon}</div>
        <p className="text-xs font-semibold">{label}</p>
      </button>
  );

  return (
    <div className="p-4 space-y-6">
        <div className="px-2">
            <h1 className="text-3xl font-bold text-text-primary">{greeting}</h1>
            <p className="text-text-secondary">Seu assistente de inspeções está pronto.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickActionButton label="Nova Inspeção" icon={<PlusIcon className="w-6 h-6"/>} onClick={() => setView('agenda')} />
          <QuickActionButton label="Novo Cliente" icon={<ClientsIcon className="w-6 h-6"/>} onClick={() => setView('clients')} />
          <QuickActionButton label="Equipamentos" icon={<EquipmentIcon className="w-6 h-6"/>} onClick={() => setView('equipment')} />
          <QuickActionButton label="Relatórios" icon={<ReportsIcon className="w-6 h-6"/>} onClick={() => setView('reports')} />
        </div>
        <div className="space-y-6">
            <Card title="🔔 Alertas de Vencimento" collapsible>
                <div className="space-y-3">
                    {expiringEquipment.length > 0 ? expiringEquipment.map(eq => (
                        <div key={eq.id} className="text-sm p-3 bg-primary rounded-md">
                            <p className="font-semibold text-text-primary">{eq.name} ({eq.serialNumber})</p>
                            <p className="text-status-reproved">Vence em: {new Date(eq.expiryDate).toLocaleDateString()}</p>
                        </div>
                    )) : <p className="text-text-secondary text-sm">Nenhum equipamento vencendo em breve.</p>}
                </div>
            </Card>
            <Card title="📅 Próximas Inspeções" collapsible>
                <div className="space-y-3">
                    {upcomingInspections.length > 0 ? upcomingInspections.map(insp => {
                        const client = clients.find(c => c.id === insp.clientId);
                        return (
                            <div key={insp.id} className="text-sm p-3 bg-primary rounded-md">
                                <p className="font-semibold text-text-primary">{client?.name}</p>
                                <p className="text-text-secondary">Data: {new Date(insp.date).toLocaleDateString()}</p>
                            </div>
                        );
                    }) : <p className="text-text-secondary text-sm">Nenhuma inspeção agendada para os próximos dias.</p>}
                </div>
            </Card>
        </div>
    </div>
  );
};