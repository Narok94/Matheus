import React, { useMemo } from 'react';
import { View, InspectionStatus, PaymentStatus } from '../../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common';
import { PlusIcon, ClientsIcon, EquipmentIcon, AgendaIcon, ReportsIcon, SettingsIcon, CertificateIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from '../components/Icons';
import { parseLocalDate } from '../utils';


const DashboardGridButton = ({ label, icon, onClick }: { label: string, icon: React.ReactNode, onClick: () => void }) => (
    <button onClick={onClick} className="bg-secondary/70 dark:bg-secondary/70 backdrop-blur-md p-4 rounded-xl text-text-primary flex flex-col items-center justify-center text-center hover:border-accent transition-all duration-200 shadow-lg dark:shadow-cyan-900/10 border border-border space-y-2 transform active:scale-95 aspect-square min-h-[110px] md:min-h-0">
      <div className="text-accent">{icon}</div>
      <p className="text-xs font-semibold whitespace-normal leading-tight">{label}</p>
    </button>
);

const daysUntil = (date: Date) => Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

export const Dashboard = ({ setView, onNewInspection }: { setView: (view: View) => void; onNewInspection: () => void; }) => {
  const { clients, inspections, financial, expenses } = useData();
  const { currentUserDetails } = useAuth();
  
  const firstName = currentUserDetails?.fullName?.split(' ')[0] || 'Usuário';

  const financialSummary = useMemo(() => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      const totalToReceive = financial
          .filter(r => {
              if (r.status !== PaymentStatus.Pendente || !r.dueDate) return false;
              const dueDate = parseLocalDate(r.dueDate);
              return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
          })
          .reduce((sum, r) => sum + r.value, 0);

      const totalReceived = financial
          .filter(r => {
              if (r.status !== PaymentStatus.Pago || !r.paymentDate) return false;
              const paymentDate = parseLocalDate(r.paymentDate);
              return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
          })
          .reduce((sum, r) => sum + r.value, 0);

      const totalToPay = expenses
          .filter(p => {
              if (p.status !== PaymentStatus.Pendente || !p.dueDate) return false;
              const dueDate = parseLocalDate(p.dueDate);
              return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
          })
          .reduce((sum, p) => sum + p.value, 0);

      return {
          totalToReceive: formatCurrency(totalToReceive),
          totalReceived: formatCurrency(totalReceived),
          totalToPay: formatCurrency(totalToPay),
      };
  }, [financial, expenses]);
  
  const upcomingInspections = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    return inspections
        .filter(i => {
            const inspectionDate = parseLocalDate(i.date);
            return i.status === InspectionStatus.Agendada && inspectionDate >= today;
        })
        .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())
        .slice(0, 5); // Limit to 5 for the dashboard
  }, [inspections]);
  
  return (
    <div className="p-4 space-y-6">
      {/* Greeting */}
      <div className="text-left">
          <h1 className="text-2xl font-bold text-text-primary">Olá, {firstName}!</h1>
          <p className="text-text-secondary">Aqui está um resumo da sua operação hoje.</p>
      </div>

      {/* Alert Lists */}
      <div className="space-y-6">
          <Card title="💰 Resumo Financeiro (Mês Atual)" collapsible>
              <div className="space-y-3">
                  <div className="p-3 bg-primary rounded-lg border border-border">
                      <div className="flex justify-between items-center text-sm">
                          <div>
                              <p className="text-text-secondary">A Receber</p>
                              <p className="text-lg font-bold text-status-pending">{financialSummary.totalToReceive}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-text-secondary">Recebido</p>
                              <p className="text-lg font-bold text-status-approved">{financialSummary.totalReceived}</p>
                          </div>
                      </div>
                  </div>
                  <div className="p-3 bg-primary rounded-lg border border-border">
                      <div className="flex justify-start items-center text-sm">
                          <div>
                              <p className="text-text-secondary">A Pagar</p>
                              <p className="text-lg font-bold text-orange-500">{financialSummary.totalToPay}</p>
                          </div>
                      </div>
                  </div>
              </div>
          </Card>

          <Card title={`🗓️ Vistorias Agendadas (${upcomingInspections.length})`} collapsible>
              <div className="space-y-3">
                  {upcomingInspections.length > 0 ? upcomingInspections.map(inspection => {
                      const client = clients.find(c => c.id === inspection.clientId);
                      const inspectionDate = parseLocalDate(inspection.date);
                      const daysLeft = daysUntil(inspectionDate);
                      const urgencyColor = daysLeft <= 1 ? 'text-status-reproved' : daysLeft <= 7 ? 'text-status-pending' : 'text-text-secondary';
                      
                      return (
                        <div key={inspection.id} className="text-sm p-3 bg-primary rounded-lg border border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-text-primary flex items-center">
                                        <AgendaIcon className="w-4 h-4 mr-2" />
                                        Vistoria Agendada
                                    </p>
                                    <p className="text-text-secondary text-xs mt-1">Cliente: {client?.name || 'N/A'}</p>
                                </div>
                                <div className={`text-right flex-shrink-0 ml-2`}>
                                     <p className={`font-bold ${urgencyColor}`}>{daysLeft > 0 ? `Em ${daysLeft} dia(s)` : `Hoje`}</p>
                                     <p className="text-xs text-text-secondary">{inspectionDate.toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                      )
                  }) : <p className="text-text-secondary text-sm">Nenhuma vistoria agendada para os próximos dias.</p>}
              </div>
          </Card>
      </div>

      {/* Grid Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <DashboardGridButton label="Nova Vistoria" icon={<PlusIcon className="w-8 h-8" />} onClick={onNewInspection} />
        <DashboardGridButton label="Clientes" icon={<ClientsIcon className="w-8 h-8" />} onClick={() => setView('clients')} />
        <DashboardGridButton label="Cadastro de Equip." icon={<EquipmentIcon className="w-8 h-8" />} onClick={() => setView('equipment')} />
        <DashboardGridButton label="Agenda" icon={<AgendaIcon className="w-8 h-8" />} onClick={() => setView('agenda')} />
        <DashboardGridButton label="Relatórios" icon={<ReportsIcon className="w-8 h-8" />} onClick={() => setView('reports')} />
        <DashboardGridButton label="Contas a Pagar" icon={<ArrowUpCircleIcon />} onClick={() => setView('payables')} />
        <DashboardGridButton label="Contas a Receber" icon={<ArrowDownCircleIcon />} onClick={() => setView('financial')} />
        <DashboardGridButton label="Certificados" icon={<CertificateIcon className="w-8 h-8" />} onClick={() => setView('certificates')} />
        <DashboardGridButton label="Configurações" icon={<SettingsIcon className="w-8 h-8" />} onClick={() => setView('settings')} />
      </div>
    </div>
  );
};