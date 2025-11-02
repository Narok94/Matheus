

import React, { useState, useMemo, ReactNode, useEffect } from 'react';
import { Client, Equipment, Inspection, FinancialRecord, Certificate, InspectionStatus, PaymentStatus, View } from '../../types';
import { Card, Modal, getStatusBadge, Button, Input, Select, Textarea, FormField, EmptyState, ConfirmationModal, FloatingActionButton, ToggleSwitch } from './common';
import { ClientsIcon, EquipmentIcon, PlusIcon, CertificateIcon, AgendaIcon, FinancialIcon, LogoutIcon, DownloadIcon, ReportsIcon, EditIcon, TrashIcon } from './Icons';

// --- UTILITY FUNCTIONS ---
const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDocument = (value: string): string => {
  if (!value) return '';
  const onlyDigits = value.replace(/\D/g, '');

  if (onlyDigits.length <= 11) {
    return onlyDigits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  }

  return onlyDigits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .slice(0, 18);
};

const formatPhone = (value: string): string => {
    if (!value) return '';
    const onlyDigits = value.replace(/\D/g, '');
    return onlyDigits.slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(onlyDigits.length === 11 ? /(\d{5})(\d)/ : /(\d{4})(\d)/, '$1-$2');
};

const FinancialChart = ({ received, pending }: { received: number; pending: number; }) => {
    const total = received + pending;
    if (total === 0) {
        return <div className="text-center text-text-secondary p-4">Nenhum dado financeiro para exibir.</div>;
    }
    const receivedPercent = (received / total) * 100;
    
    return (
        <div className="space-y-4">
            <div className="w-full bg-primary rounded-full h-4 flex overflow-hidden border border-border">
                <div style={{ width: `${receivedPercent}%` }} className="bg-status-approved transition-all duration-500 rounded-full" />
            </div>
            <div className="flex justify-between text-sm">
                 <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-status-approved mr-2"></span>
                    <div>
                        <p className="text-text-secondary">Recebido</p>
                        <p className="font-bold text-text-primary">R$ {received.toFixed(2).replace('.', ',')}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-text-secondary">Pendente</p>
                    <p className="font-bold text-text-primary">R$ {pending.toFixed(2).replace('.', ',')}</p>
                 </div>
            </div>
        </div>
    );
};


// --- DASHBOARD ---
export const Dashboard = ({ clients, equipment, inspections, financial, setView }: { clients: Client[], equipment: Equipment[], inspections: Inspection[], financial: FinancialRecord[], setView: (view: View) => void }) => {
  const upcomingInspections = inspections.filter(i => new Date(i.date) > new Date() && i.status === InspectionStatus.Agendada).slice(0, 3);
  const expiringEquipment = equipment.filter(e => new Date(e.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 3))).slice(0, 3);
  const financialSummary = financial.reduce((acc, record) => {
    if (record.status === PaymentStatus.Pago) acc.received += record.value;
    if (record.status === PaymentStatus.Pendente) acc.pending += record.value;
    return acc;
  }, { received: 0, pending: 0 });

  const QuickActionButton = ({ label, icon, onClick }: { label: string, icon: ReactNode, onClick: () => void }) => (
      <button onClick={onClick} className="bg-secondary p-4 rounded-xl text-text-primary flex flex-col items-center justify-center text-center hover:bg-primary transition-colors shadow-sm border border-border space-y-2">
        <div className="text-accent text-2xl">{icon}</div>
        <p className="text-xs font-semibold">{label}</p>
      </button>
  );

  return (
    <div className="p-4 space-y-6">
        <div className="px-4">
            <h1 className="text-2xl font-bold text-text-primary">Olá!</h1>
            <p className="text-text-secondary">Aqui está um resumo do seu dia.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickActionButton label="Nova Inspeção" icon={<AgendaIcon className="w-6 h-6"/>} onClick={() => setView('agenda')} />
          <QuickActionButton label="Novo Cliente" icon={<ClientsIcon className="w-6 h-6"/>} onClick={() => setView('clients')} />
          <QuickActionButton label="Ver Relatórios" icon={<ReportsIcon className="w-6 h-6"/>} onClick={() => setView('reports')} />
          <QuickActionButton label="Financeiro" icon={<FinancialIcon className="w-6 h-6"/>} onClick={() => setView('financial')} />
        </div>
        <div className="space-y-6">
            <Card title="💰 Resumo Financeiro">
               <FinancialChart received={financialSummary.received} pending={financialSummary.pending} />
            </Card>
            <Card title="🔔 Alertas de Vencimento">
                <div className="space-y-3">
                    {expiringEquipment.length > 0 ? expiringEquipment.map(eq => (
                        <div key={eq.id} className="text-sm p-3 bg-primary rounded-md">
                            <p className="font-semibold text-text-primary">{eq.name} ({eq.serialNumber})</p>
                            <p className="text-status-reproved">Vence em: {new Date(eq.expiryDate).toLocaleDateString()}</p>
                        </div>
                    )) : <p className="text-text-secondary text-sm">Nenhum equipamento vencendo.</p>}
                </div>
            </Card>
            <Card title="📅 Próximas Inspeções">
                <div className="space-y-3">
                    {upcomingInspections.length > 0 ? upcomingInspections.map(insp => {
                        const client = clients.find(c => c.id === insp.clientId);
                        return (
                            <div key={insp.id} className="text-sm p-3 bg-primary rounded-md">
                                <p className="font-semibold text-text-primary">{client?.name}</p>
                                <p className="text-text-secondary">Data: {new Date(insp.date).toLocaleDateString()}</p>
                            </div>
                        );
                    }) : <p className="text-text-secondary text-sm">Nenhuma inspeção agendada.</p>}
                </div>
            </Card>
        </div>
    </div>
  );
};

// --- CLIENTS ---
interface ClientsProps {
    clients: Client[];
    onAddClient: (client: Omit<Client, 'id'>) => void;
    onViewClient: (clientId: string) => void;
}
export const Clients: React.FC<ClientsProps> = ({ clients, onViewClient, onAddClient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', document: '', address: '', city: '', contact: '', email: '' });

    const filteredClients = useMemo(() =>
        clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.document.includes(searchTerm) ||
            client.city.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm, clients]);

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        switch (name) {
            case 'name':
            case 'address':
            case 'city':
                formattedValue = capitalizeWords(value);
                break;
            case 'document':
                formattedValue = formatDocument(value);
                break;
            case 'contact':
                formattedValue = formatPhone(value);
                break;
        }

        setNewClient(prev => ({ ...prev, [name]: formattedValue }));
    };
    
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onAddClient(newClient);
        setNewClient({ name: '', document: '', address: '', city: '', contact: '', email: '' });
        setAddModalOpen(false);
    };

    return (
        <div className="p-4 space-y-4">
            <Input type="text" placeholder="🔍 Buscar por nome, CNPJ ou cidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            
            <div className="space-y-3">
                {filteredClients.length > 0 ? filteredClients.map(client => (
                    <div key={client.id} className="bg-secondary p-4 rounded-lg shadow-sm border border-border cursor-pointer hover:bg-primary transition-all duration-300 hover:shadow-md hover:border-accent/20 hover:-translate-y-px active:scale-[0.99] active:bg-primary/90" onClick={() => onViewClient(client.id)}>
                         <div className="flex items-center">
                            <div className="bg-accent/10 text-accent rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                                {client.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-text-primary">{client.name}</h4>
                                <p className="text-sm text-text-secondary">{client.city}</p>
                            </div>
                        </div>
                    </div>
                )) : <EmptyState message="Nenhum cliente encontrado." icon={<ClientsIcon className="w-12 h-12" />} action={<Button onClick={() => setAddModalOpen(true)}>Adicionar Cliente</Button>} /> }
            </div>
            <FloatingActionButton onClick={() => setAddModalOpen(true)} icon={<PlusIcon />} />
            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar Novo Cliente">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Nome Completo / Razão Social"><Input name="name" value={newClient.name} onChange={handleInputChange} required /></FormField>
                    <FormField label="CPF / CNPJ"><Input name="document" value={newClient.document} onChange={handleInputChange} required /></FormField>
                    <FormField label="Endereço"><Input name="address" value={newClient.address} onChange={handleInputChange} /></FormField>
                    <FormField label="Cidade"><Input name="city" value={newClient.city} onChange={handleInputChange} required /></FormField>
                    <FormField label="Contato (Telefone)"><Input name="contact" type="tel" value={newClient.contact} onChange={handleInputChange} required /></FormField>
                    <FormField label="Email"><Input name="email" type="email" value={newClient.email} onChange={handleInputChange} /></FormField>
                    <div className="flex justify-end pt-4"><Button type="submit">Salvar Cliente</Button></div>
                </form>
            </Modal>
        </div>
    );
};


// --- CLIENT DETAIL ---
export const ClientDetail: React.FC<{ client: Client; equipment: Equipment[]; inspections: Inspection[]; onUpdateClient: (client: Client) => void; onDeleteClient: (clientId: string) => void; onScheduleInspection: (clientId: string) => void; }> = ({ client, equipment, inspections, onUpdateClient, onDeleteClient, onScheduleInspection }) => {
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editedClient, setEditedClient] = useState(client);

    const clientEquipment = equipment.filter(e => e.clientId === client.id);
    const clientInspections = inspections.filter(i => i.clientId === client.id);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'document') formattedValue = formatDocument(value);
        if (name === 'contact') formattedValue = formatPhone(value);
        if (['name', 'address', 'city'].includes(name)) formattedValue = capitalizeWords(value);
        setEditedClient(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateClient(editedClient);
        setEditModalOpen(false);
    };

    return (
        <div className="p-4 space-y-6">
            <Card className="!bg-transparent !shadow-none !border-none">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">{client.name}</h2>
                        <p className="text-text-secondary">{client.document}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => setEditModalOpen(true)} className="p-2 text-text-secondary hover:text-accent"><EditIcon /></button>
                        <button onClick={() => setDeleteModalOpen(true)} className="p-2 text-text-secondary hover:text-status-reproved"><TrashIcon /></button>
                    </div>
                </div>
                 <div className="mt-4 text-sm text-text-secondary space-y-1">
                    <p>{client.address}, {client.city}</p>
                    <p>{client.contact} &middot; {client.email}</p>
                </div>
            </Card>

            <Button onClick={() => onScheduleInspection(client.id)} className="w-full justify-center">
                <AgendaIcon className="w-5 h-5" />
                <span>Agendar Inspeção para este Cliente</span>
            </Button>

            <Card title={`Equipamentos (${clientEquipment.length})`}>
                {clientEquipment.length > 0 ? clientEquipment.map(eq => (
                    <div key={eq.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                        <div>
                            <p className="font-semibold text-text-primary">{eq.name} <span className="text-text-secondary text-xs">({eq.serialNumber})</span></p>
                            <p className="text-sm text-text-secondary">Vencimento: {new Date(eq.expiryDate).toLocaleDateString()}</p>
                        </div>
                        {getStatusBadge(eq.status)}
                    </div>
                )) : <p className="text-text-secondary text-sm">Nenhum equipamento cadastrado.</p>}
            </Card>

            <Card title={`Histórico de Inspeções (${clientInspections.length})`}>
                {clientInspections.length > 0 ? clientInspections.map(insp => (
                    <div key={insp.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                        <div>
                            <p className="font-semibold text-text-primary">Data: {new Date(insp.date).toLocaleDateString()}</p>
                            <p className="text-sm text-text-secondary">Inspetor: {insp.inspector}</p>
                        </div>
                        {getStatusBadge(insp.status)}
                    </div>
                )) : <p className="text-text-secondary text-sm">Nenhuma inspeção realizada.</p>}
            </Card>
            
            {/* Modals */}
             <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Cliente">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <FormField label="Nome Completo / Razão Social"><Input name="name" value={editedClient.name} onChange={handleInputChange} required /></FormField>
                    <FormField label="CPF / CNPJ"><Input name="document" value={editedClient.document} onChange={handleInputChange} required /></FormField>
                    <FormField label="Endereço"><Input name="address" value={editedClient.address} onChange={handleInputChange} /></FormField>
                    <FormField label="Cidade"><Input name="city" value={editedClient.city} onChange={handleInputChange} required /></FormField>
                    <FormField label="Contato (Telefone)"><Input name="contact" type="tel" value={editedClient.contact} onChange={handleInputChange} required /></FormField>
                    <FormField label="Email"><Input name="email" type="email" value={editedClient.email} onChange={handleInputChange} /></FormField>
                    <div className="flex justify-end pt-4"><Button type="submit">Salvar Alterações</Button></div>
                </form>
            </Modal>
            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => onDeleteClient(client.id)}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir ${client.name}? Todos os equipamentos e inspeções associados também serão removidos. Esta ação não pode ser desfeita.`}
            />
        </div>
    );
};


// --- EQUIPMENTS ---
export const Equipments: React.FC<{ equipment: Equipment[], clients: Client[], onAddEquipment: (eq: Omit<Equipment, 'id'>) => void }> = ({ equipment, clients, onAddEquipment }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [newEquipment, setNewEquipment] = useState({ clientId: '', name: '', serialNumber: '', expiryDate: '', type: '', capacity: '', manufacturer: '', status: InspectionStatus.Agendada });

    const filteredEquipment = useMemo(() => {
        return equipment.filter(eq => {
            const client = clients.find(c => c.id === eq.clientId);
            return eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   client?.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [searchTerm, equipment, clients]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddEquipment(newEquipment);
        setNewEquipment({ clientId: '', name: '', serialNumber: '', expiryDate: '', type: '', capacity: '', manufacturer: '', status: InspectionStatus.Agendada });
        setAddModalOpen(false);
    };

    return (
        <div className="p-4 space-y-4">
             <Input type="text" placeholder="🔍 Buscar por nome, série ou cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             <div className="space-y-3">
                {filteredEquipment.length > 0 ? filteredEquipment.map(eq => {
                    const client = clients.find(c => c.id === eq.clientId);
                    return (
                        <Card key={eq.id} className="p-0">
                             <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-text-primary">{eq.name}</h4>
                                        <p className="text-sm text-text-secondary">{eq.serialNumber}</p>
                                    </div>
                                    {getStatusBadge(eq.status)}
                                </div>
                                <div className="text-xs text-text-secondary mt-2">
                                    <p>Cliente: <span className="font-semibold text-text-primary">{client?.name}</span></p>
                                    <p>Vencimento: {new Date(eq.expiryDate).toLocaleDateString()}</p>
                                </div>
                             </div>
                        </Card>
                    );
                }) : <EmptyState message="Nenhum equipamento encontrado." icon={<EquipmentIcon className="w-12 h-12" />} action={<Button onClick={() => setAddModalOpen(true)}>Adicionar Equipamento</Button>} />}
            </div>
             <FloatingActionButton onClick={() => setAddModalOpen(true)} icon={<PlusIcon />} />
              <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar Equipamento">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Cliente">
                        <Select name="clientId" value={newEquipment.clientId} onChange={(e) => setNewEquipment(p => ({...p, clientId: e.target.value}))} required>
                            <option value="">Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </FormField>
                    <FormField label="Nome do Equipamento"><Input name="name" value={newEquipment.name} onChange={(e) => setNewEquipment(p => ({...p, name: e.target.value}))} required /></FormField>
                    <FormField label="Número de Série"><Input name="serialNumber" value={newEquipment.serialNumber} onChange={(e) => setNewEquipment(p => ({...p, serialNumber: e.target.value}))} required /></FormField>
                    <FormField label="Data de Vencimento"><Input type="date" name="expiryDate" value={newEquipment.expiryDate} onChange={(e) => setNewEquipment(p => ({...p, expiryDate: e.target.value}))} required /></FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Tipo"><Input name="type" value={newEquipment.type} onChange={(e) => setNewEquipment(p => ({...p, type: e.target.value}))} /></FormField>
                        <FormField label="Capacidade"><Input name="capacity" value={newEquipment.capacity} onChange={(e) => setNewEquipment(p => ({...p, capacity: e.target.value}))} /></FormField>
                    </div>
                    <FormField label="Fabricante"><Input name="manufacturer" value={newEquipment.manufacturer} onChange={(e) => setNewEquipment(p => ({...p, manufacturer: e.target.value}))} /></FormField>
                    <div className="flex justify-end pt-4"><Button type="submit">Adicionar Equipamento</Button></div>
                </form>
            </Modal>
        </div>
    );
};


// --- AGENDA ---
export const Agenda: React.FC<{ inspections: Inspection[], clients: Client[], onAddInspection: (insp: Omit<Inspection, 'id'>) => void, prefilledData: { clientId?: string } | null, onPrefillHandled: () => void, showToast: (msg: string, type?: 'success' | 'error') => void }> = ({ inspections, clients, onAddInspection, prefilledData, onPrefillHandled, showToast }) => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [newInspection, setNewInspection] = useState({ clientId: '', equipmentIds: [] as string[], date: '', inspector: 'João Silva', observations: '', status: InspectionStatus.Agendada });
    
    useEffect(() => {
        if(prefilledData) {
            setNewInspection(prev => ({
                ...prev,
                clientId: prefilledData.clientId || '',
                date: new Date().toISOString().split('T')[0],
                observations: '',
            }));
            setAddModalOpen(true);
            onPrefillHandled();
        }
    }, [prefilledData, onPrefillHandled]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newInspection.equipmentIds.length === 0) {
            showToast("Selecione ao menos um equipamento para a inspeção.", "error");
            return;
        }
        onAddInspection(newInspection);
        setNewInspection({ clientId: '', equipmentIds: [], date: '', inspector: 'João Silva', observations: '', status: InspectionStatus.Agendada });
        setAddModalOpen(false);
    };

    const sortedInspections = useMemo(() => [...inspections].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [inspections]);

    return (
        <div className="p-4 space-y-4">
            {sortedInspections.length > 0 ? sortedInspections.map(insp => {
                const client = clients.find(c => c.id === insp.clientId);
                return (
                    <Card key={insp.id} className="p-0">
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-text-primary">{client?.name}</h4>
                                    <p className="text-sm text-text-secondary">{new Date(insp.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                {getStatusBadge(insp.status)}
                            </div>
                            <p className="text-xs text-text-secondary mt-2">Inspetor: {insp.inspector}</p>
                        </div>
                    </Card>
                )
            }) : <EmptyState message="Nenhuma inspeção na agenda." icon={<AgendaIcon className="w-12 h-12" />} action={<Button onClick={() => setAddModalOpen(true)}>Agendar Inspeção</Button>} />}
             <FloatingActionButton onClick={() => setAddModalOpen(true)} icon={<PlusIcon />} />
             <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Agendar Nova Inspeção">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Cliente">
                        <Select name="clientId" value={newInspection.clientId} onChange={(e) => setNewInspection(p => ({...p, clientId: e.target.value, equipmentIds: []}))} required>
                            <option value="">Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </FormField>
                    <FormField label="Data da Inspeção"><Input type="date" name="date" value={newInspection.date} onChange={(e) => setNewInspection(p => ({...p, date: e.target.value}))} required /></FormField>
                    {/* Add Equipment Selector Here */}
                    <FormField label="Observações"><Textarea name="observations" value={newInspection.observations} onChange={(e) => setNewInspection(p => ({...p, observations: e.target.value}))} /></FormField>
                    <div className="flex justify-end pt-4"><Button type="submit">Agendar</Button></div>
                </form>
            </Modal>
        </div>
    );
};

// --- CERTIFICATES ---
export const Certificates: React.FC<{ certificates: Certificate[], clients: Client[] }> = ({ certificates, clients }) => {
    return (
        <div className="p-4 space-y-4">
            {certificates.length > 0 ? certificates.map(cert => {
                const client = clients.find(c => c.id === cert.clientId);
                return (
                    <Card key={cert.id}>
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold text-text-primary">{client?.name}</h4>
                                <p className="text-sm text-text-secondary">Certificado #{cert.id.slice(-6)}</p>
                                <p className="text-xs text-text-secondary">Válido até: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                            </div>
                            <Button variant="secondary" onClick={() => alert('Download')}>Baixar</Button>
                        </div>
                    </Card>
                );
            }) : <EmptyState message="Nenhum certificado emitido." icon={<CertificateIcon className="w-12 h-12" />} />}
        </div>
    );
};

// --- REPORTS ---
export const Reports: React.FC<{ equipment: Equipment[], clients: Client[] }> = ({ equipment, clients }) => {
    const handleDownload = () => {
        const dataToExport = equipment.map(eq => {
            const client = clients.find(c => c.id === eq.clientId);
            return {
                "Equipamento": eq.name,
                "Número de Série": eq.serialNumber,
                "Cliente": client?.name || 'N/A',
                "Status": eq.status,
                "Data de Vencimento": new Date(eq.expiryDate).toLocaleDateString(),
                "Última Inspeção": eq.lastInspectionDate ? new Date(eq.lastInspectionDate).toLocaleDateString() : 'N/A',
            };
        });

        const worksheet = (window as any).XLSX.utils.json_to_sheet(dataToExport);
        const workbook = (window as any).XLSX.utils.book_new();
        (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, "Equipamentos");
        (window as any).XLSX.writeFile(workbook, "Relatorio_Equipamentos_InspecPro.xlsx");
    };

    return (
        <div className="p-4 space-y-6">
            <Card title="Relatório de Equipamentos">
                <p className="text-text-secondary mb-4">Gere um relatório completo de todos os equipamentos cadastrados no sistema em formato Excel.</p>
                <Button onClick={handleDownload}>
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Baixar Relatório .xlsx
                </Button>
            </Card>
        </div>
    );
};

// --- FINANCIAL ---
export const Financial: React.FC<{ financial: FinancialRecord[], clients: Client[], onAddFinancial: (rec: Omit<FinancialRecord, 'id'>) => void }> = ({ financial, clients, onAddFinancial }) => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [newRecord, setNewRecord] = useState({ clientId: '', inspectionId: '', description: '', value: 0, issueDate: '', dueDate: '', status: PaymentStatus.Pendente });
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddFinancial(newRecord);
        setNewRecord({ clientId: '', inspectionId: '', description: '', value: 0, issueDate: '', dueDate: '', status: PaymentStatus.Pendente });
        setAddModalOpen(false);
    };

    return (
        <div className="p-4 space-y-4">
            {financial.length > 0 ? financial.map(rec => {
                const client = clients.find(c => c.id === rec.clientId);
                return (
                    <Card key={rec.id}>
                        <div className="flex justify-between items-start">
                             <div>
                                <h4 className="font-semibold text-text-primary">R$ {rec.value.toFixed(2).replace('.', ',')}</h4>
                                <p className="text-sm text-text-secondary">{rec.description}</p>
                                <p className="text-xs text-text-secondary">{client?.name}</p>
                            </div>
                            {getStatusBadge(rec.status)}
                        </div>
                    </Card>
                );
            }) : <EmptyState message="Nenhum registro financeiro." icon={<FinancialIcon className="w-12 h-12" />} action={<Button onClick={() => setAddModalOpen(true)}>Adicionar Registro</Button>}/>}
             <FloatingActionButton onClick={() => setAddModalOpen(true)} icon={<PlusIcon />} />
             <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar Registro Financeiro">
                 <form onSubmit={handleFormSubmit} className="space-y-4">
                     {/* Simplified form */}
                    <FormField label="Cliente">
                        <Select name="clientId" value={newRecord.clientId} onChange={e => setNewRecord(p => ({...p, clientId: e.target.value}))} required>
                            <option value="">Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </FormField>
                    <FormField label="Descrição"><Input value={newRecord.description} onChange={e => setNewRecord(p => ({...p, description: e.target.value}))} required/></FormField>
                    <FormField label="Valor (R$)"><Input type="number" step="0.01" value={newRecord.value} onChange={e => setNewRecord(p => ({...p, value: parseFloat(e.target.value)}))} required /></FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Data de Emissão"><Input type="date" value={newRecord.issueDate} onChange={e => setNewRecord(p => ({...p, issueDate: e.target.value}))} required /></FormField>
                        <FormField label="Data de Vencimento"><Input type="date" value={newRecord.dueDate} onChange={e => setNewRecord(p => ({...p, dueDate: e.target.value}))} required /></FormField>
                    </div>
                     <FormField label="Status">
                        <Select value={newRecord.status} onChange={e => setNewRecord(p => ({...p, status: e.target.value as PaymentStatus}))}>
                            <option value={PaymentStatus.Pendente}>Pendente</option>
                            <option value={PaymentStatus.Pago}>Pago</option>
                        </Select>
                    </FormField>
                    <div className="flex justify-end pt-4"><Button type="submit">Salvar Registro</Button></div>
                 </form>
             </Modal>
        </div>
    );
};

// --- SETTINGS ---
export const Settings: React.FC<{ 
    theme: 'light' | 'dark', setTheme: (theme: 'light' | 'dark') => void,
    profile: { name: string }, setProfile: (profile: { name: string }) => void,
    settings: { notifications: boolean, reminders: boolean }, setSettings: (s: { notifications: boolean, reminders: boolean }) => void,
    showToast: (msg: string) => void,
    onLogout: () => void,
}> = ({ theme, setTheme, profile, setProfile, settings, setSettings, showToast, onLogout }) => {
    
    const [companyName, setCompanyName] = useState(profile.name);

    const handleProfileSave = () => {
        setProfile({ name: companyName });
        showToast("Perfil da empresa atualizado!");
    };

    return (
        <div className="p-4 space-y-8">
            <Card title="Perfil da Empresa">
                <div className="space-y-4">
                    <FormField label="Nome da Empresa">
                        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </FormField>
                    <Button onClick={handleProfileSave}>Salvar Alterações</Button>
                </div>
            </Card>

            <Card title="Aparência">
                <div className="flex items-center justify-between">
                    <span className="text-text-primary font-medium">Modo Escuro</span>
                    <ToggleSwitch enabled={theme === 'dark'} onChange={(enabled) => setTheme(enabled ? 'dark' : 'light')} />
                </div>
            </Card>

             <Card title="Notificações">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-text-primary font-medium">Habilitar Notificações</span>
                        <ToggleSwitch enabled={settings.notifications} onChange={(enabled) => setSettings({...settings, notifications: enabled})} />
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-text-primary font-medium">Lembretes de Vencimento</span>
                        <ToggleSwitch enabled={settings.reminders} onChange={(enabled) => setSettings({...settings, reminders: enabled})} />
                    </div>
                </div>
            </Card>

            <Card title="Conta">
                 <Button variant="secondary" onClick={onLogout} className="w-full justify-center !text-status-reproved">
                    <LogoutIcon className="w-5 h-5 mr-2" />
                    <span>Sair da Conta</span>
                </Button>
            </Card>
        </div>
    );
};