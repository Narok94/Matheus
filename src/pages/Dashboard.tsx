import React, { useMemo } from 'react';
import { View, DeliveryStatus, LicenseStatus, License, ClientEquipment, InspectionStatus } from '../../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/common';
import { PlusIcon, ClientsIcon, EquipmentIcon, AgendaIcon, ReportsIcon, SettingsIcon, CertificateIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, FireExtinguisherIcon } from '../components/Icons';
import { parseLocalDate } from '../utils';


const DashboardGridButton = ({ label, icon, onClick }: { label: string, icon: React.ReactNode, onClick: () => void }) => (
    <button onClick={onClick} className="bg-secondary/70 dark:bg-secondary/70 backdrop-blur-md p-4 rounded-xl text-text-primary flex flex-col items-center justify-center text-center hover:border-accent transition-all duration-200 shadow-lg dark:shadow-cyan-900/10 border border-border space-y-2 transform active:scale-95 aspect-square min-h-[110px] md:min-h-0">
      <div className="text-accent">{icon}</div>
      <p className="text-xs font-semibold whitespace-normal leading-tight">{label}</p>
    </button>
);

const daysUntil = (date: Date) => Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

export const Dashboard = ({ setView, onScheduleForClient }: { setView: (view: View) => void; onScheduleForClient: (clientId: string) => void; }) => {
  const { clients, licenses, deliveries, clientEquipment, handleUpdateLicense, equipment } = useData();
  const { currentUserDetails } = useAuth();
  
  const firstName = currentUserDetails?.fullName?.split(' ')[0] || 'Usuário';

  const pendingDeliveries = deliveries.filter(d => d.status === DeliveryStatus.Pendente).slice(0, 3);
  
  const expiringItems = useMemo(() => {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const pendingLicenses = licenses
        .filter(l => l.status === LicenseStatus.Pendente && parseLocalDate(l.expiryDate) < ninetyDaysFromNow)
        .map(l => ({ ...l, expiryDateObj: parseLocalDate(l.expiryDate) }));

    const expiringClientEquipment = clientEquipment
        .filter(e => parseLocalDate(e.expiryDate) < ninetyDaysFromNow && e.status !== InspectionStatus.Reprovado)
        .map(e => ({ ...e, expiryDateObj: parseLocalDate(e.expiryDate) }));
    
    const combined = [
        ...pendingLicenses.map(l => ({
            id: l.id,
            type: 'license' as const,
            clientId: l.clientId,
            name: l.type,
            expiryDate: l.expiryDateObj,
            original: l
        })),
        ...expiringClientEquipment.map(e => {
            const product = equipment.find(p => p.id === e.equipmentId);
            return {
                id: e.id,
                type: 'equipment' as const,
                clientId: e.clientId,
                name: product?.name || 'Equipamento desconhecido',
                expiryDate: e.expiryDateObj,
                original: e
            }
        })
    ];
    
    return combined.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime()).slice(0, 5);
  }, [licenses, clientEquipment, equipment]);
  
  return (
    <div className="p-4 space-y-6">
      {/* Greeting */}
      <div className="text-left">
          <h1 className="text-2xl font-bold text-text-primary">Olá, {firstName}!</h1>
          <p className="text-text-secondary">Aqui está um resumo da sua operação hoje.</p>
      </div>

      {/* Alert Lists */}
      <div className="space-y-6">
          <Card title={`🚨 Alerta de Vencimentos (${expiringItems.length})`} collapsible>
              <div className="space-y-3">
                  {expiringItems.length > 0 ? expiringItems.map(item => {
                      const client = clients.find(c => c.id === item.clientId);
                      const daysLeft = daysUntil(item.expiryDate);
                      const urgencyColor = daysLeft <= 15 ? 'text-status-reproved' : daysLeft <= 30 ? 'text-status-pending' : 'text-text-secondary';
                      
                      return (
                        <div key={`${item.type}-${item.id}`} className="text-sm p-3 bg-primary rounded-lg border border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-text-primary flex items-center">
                                        {item.type === 'license' ? <CertificateIcon className="w-4 h-4 mr-2" /> : <FireExtinguisherIcon className="w-4 h-4 mr-2" />}
                                        {item.name}
                                    </p>
                                    <p className="text-text-secondary text-xs mt-1">Cliente: {client?.name || 'N/A'}</p>
                                </div>
                                <div className={`text-right flex-shrink-0 ml-2`}>
                                     <p className={`font-bold ${urgencyColor}`}>{daysLeft > 0 ? `Vence em ${daysLeft} dia(s)` : `Venceu`}</p>
                                     <p className="text-xs text-text-secondary">{item.expiryDate.toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex justify-end mt-2">
                                {item.type === 'license' ? (
                                    <Button onClick={() => handleUpdateLicense({ ...item.original as License, status: LicenseStatus.Renovada })} variant="secondary" className="!py-1.5 !px-4 !text-xs">
                                        Renovar
                                    </Button>
                                ) : (
                                    <Button onClick={() => onScheduleForClient(item.clientId)} variant="secondary" className="!py-1.5 !px-4 !text-xs">
                                       Agendar Vistoria
                                    </Button>
                                )}
                            </div>
                        </div>
                      )
                  }) : <p className="text-text-secondary text-sm">Nenhum item vencendo nos próximos 90 dias.</p>}
              </div>
          </Card>

          <Card title="🚚 Entregas Pendentes" collapsible>
              <div className="space-y-3">
                  {pendingDeliveries.length > 0 ? pendingDeliveries.map(del => {
                       const client = clients.find(c => c.id === del.clientId);
                       return (
                         <div key={del.id} className="text-sm p-3 bg-primary rounded-md">
                            <p className="font-semibold text-text-primary">{client?.name}</p>
                            <p className="text-text-secondary">{del.description}</p>
                            <p className="text-status-scheduled">Data: {parseLocalDate(del.deliveryDate).toLocaleDateString()}</p>
                         </div>
                       )
                  }) : <p className="text-text-secondary text-sm">Nenhuma entrega pendente.</p>}
              </div>
          </Card>
      </div>

      {/* Grid Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <DashboardGridButton label="Nova Vistoria" icon={<PlusIcon className="w-8 h-8" />} onClick={() => setView('agenda')} />
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