

import React, { useState, useMemo, ReactNode, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Client, Equipment, Inspection, FinancialRecord, Certificate, InspectionStatus, PaymentStatus, View } from '../../types';
import { Card, Modal, getStatusBadge, Button, Input, Select, Textarea, FormField, EmptyState, ConfirmationModal, FloatingActionButton, ToggleSwitch } from './common';
import { ClientsIcon, EquipmentIcon, PlusIcon, CertificateIcon, AgendaIcon, FinancialIcon, UserCircleIcon, ChevronRightIcon, LogoutIcon, DownloadIcon, SparklesIcon, SpinnerIcon, ReportsIcon, EditIcon, TrashIcon } from './Icons';

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
                    <div key={client.id} className="bg-secondary p-4 rounded-lg shadow-sm border border-border cursor-pointer hover:bg-primary transition-colors" onClick={() => onViewClient(client.id)}>
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
                )) : (
                   <EmptyState message="Nenhum cliente encontrado." icon={<ClientsIcon className="w-12 h-12"/>} action={
                       <Button onClick={() => setAddModalOpen(true)}>Adicionar Primeiro Cliente</Button>
                   } />
                )}
            </div>
            
            <FloatingActionButton onClick={() => setAddModalOpen(true)} icon={<PlusIcon className="w-6 h-6" />} />

            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar Novo Cliente">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Nome / Empresa"><Input name="name" required value={newClient.name} onChange={handleInputChange} /></FormField>
                    <FormField label="CNPJ / CPF"><Input name="document" required value={newClient.document} onChange={handleInputChange} /></FormField>
                    <FormField label="Endereço"><Input name="address" required value={newClient.address} onChange={handleInputChange} /></FormField>
                    <FormField label="Cidade"><Input name="city" required value={newClient.city} onChange={handleInputChange} /></FormField>
                    <FormField label="Contato (Telefone)"><Input name="contact" type="tel" required value={newClient.contact} onChange={handleInputChange} /></FormField>
                    <FormField label="Email"><Input name="email" type="email" required value={newClient.email} onChange={handleInputChange} /></FormField>
                    <div className="pt-4 flex justify-end">
                        <Button type="submit">Salvar Cliente</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// --- CLIENT DETAIL ---
interface ClientDetailProps {
    client: Client;
    equipment: Equipment[];
    inspections: Inspection[];
    onUpdateClient: (client: Client) => void;
    onDeleteClient: (clientId: string) => void;
    onScheduleInspection: (clientId: string) => void;
}
export const ClientDetail: React.FC<ClientDetailProps> = ({ client, equipment, inspections, onUpdateClient, onDeleteClient, onScheduleInspection }) => {
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const clientEquipment = equipment.filter(e => e.clientId === client.id);
    const clientInspections = inspections.filter(i => i.clientId === client.id);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const updatedClient: Client = {
            ...client,
            name: formData.get('name') as string, document: formData.get('document') as string,
            address: formData.get('address') as string, city: formData.get('city') as string,
            contact: formData.get('contact') as string, email: formData.get('email') as string,
        };
        onUpdateClient(updatedClient);
        setEditModalOpen(false);
    };

    const handleExportXLSX = () => {
        if (typeof (window as any).XLSX === 'undefined') {
            console.error("A biblioteca SheetJS (XLSX) não foi carregada.");
            return;
        }
        const XLSX = (window as any).XLSX;
    
        // 1. Client Data
        const clientData = [
            ["DADOS DO CLIENTE"],
            [],
            ["Nome:", client.name],
            ["Documento:", client.document],
            ["Endereço:", `${client.address}, ${client.city}`],
            ["Contato:", client.contact],
            ["Email:", client.email],
            [],
        ];
    
        // 2. Equipment Data
        const equipmentData = [
            ["RELATÓRIO DE EQUIPAMENTOS"],
            [],
            ["Nome", "Nº Série", "Tipo", "Capacidade", "Fabricante", "Validade", "Status"],
            ...clientEquipment.map(eq => [
                eq.name,
                eq.serialNumber,
                eq.type,
                eq.capacity,
                eq.manufacturer,
                new Date(eq.expiryDate).toLocaleDateString('pt-BR'),
                eq.status
            ]),
            [],
        ];
    
        // 3. Inspection Data
        const inspectionData = [
            ["HISTÓRICO DE INSPEÇÕES"],
            [],
            ["Data", "Inspetor", "Status", "Observações"],
            ...clientInspections.map(insp => [
                new Date(insp.date).toLocaleDateString('pt-BR'),
                insp.inspector,
                insp.status,
                insp.observations
            ]),
        ];
    
        const finalData = [...clientData, ...equipmentData, ...inspectionData];
        const ws = XLSX.utils.aoa_to_sheet(finalData);
    
        const maxCols = 7; 
        ws['!cols'] = [ { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 } ];
    
        const merges = [];
        let currentRow = 0;
    
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: maxCols - 1 } });
        currentRow += clientData.length;
    
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: maxCols - 1 } });
        currentRow += equipmentData.length;
    
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: maxCols - 1 } });
        
        ws['!merges'] = merges;
    
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relatório Cliente");
    
        XLSX.writeFile(wb, `Relatorio_${client.name.replace(/\s+/g, '_')}.xlsx`);
    };

    return (
        <div className="p-4 space-y-6">
            <Card title="Dados do Cliente" actions={
                <div className="flex items-center space-x-2">
                     <Button onClick={handleExportXLSX} variant="secondary" className="!p-2" aria-label="Exportar" title="Exportar">
                        <DownloadIcon className="w-5 h-5"/>
                     </Button>
                     <Button onClick={() => setEditModalOpen(true)} variant="secondary" className="!p-2" aria-label="Editar" title="Editar">
                        <EditIcon className="w-5 h-5"/>
                     </Button>
                     <Button onClick={() => setDeleteModalOpen(true)} className="bg-status-reproved/80 hover:bg-status-reproved text-white !p-2" aria-label="Excluir" title="Excluir">
                         <TrashIcon className="w-5 h-5"/>
                     </Button>
                </div>
            }>
                <div className="space-y-2 text-text-primary text-sm">
                    <p><strong className="text-text-secondary">CNPJ/CPF:</strong> {client.document}</p>
                    <p><strong className="text-text-secondary">Endereço:</strong> {client.address}, {client.city}</p>
                    <p><strong className="text-text-secondary">Contato:</strong> {client.contact}</p>
                    <p><strong className="text-text-secondary">Email:</strong> {client.email}</p>
                </div>
            </Card>
            
            <FloatingActionButton onClick={() => onScheduleInspection(client.id)} icon={<AgendaIcon className="w-6 h-6" />} aria-label="Agendar Inspeção para este Cliente" />

            <Card title="Equipamentos">
                {clientEquipment.length > 0 ? (
                    <ul className="space-y-2">
                        {clientEquipment.map(eq => (
                            <li key={eq.id} className="p-3 bg-primary rounded-md flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold text-text-primary">{eq.name} ({eq.serialNumber})</p>
                                    <p className="text-text-secondary">Validade: {new Date(eq.expiryDate).toLocaleDateString()}</p>
                                </div>
                                {getStatusBadge(eq.status)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-text-secondary text-sm">Nenhum equipamento cadastrado para este cliente.</p>
                )}
            </Card>

            <Card title="Histórico de Inspeções">
                {clientInspections.length > 0 ? (
                    <ul className="space-y-2">
                        {clientInspections.map(insp => (
                            <li key={insp.id} className="p-3 bg-primary rounded-md text-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-text-primary">Data: {new Date(insp.date).toLocaleDateString()}</p>
                                        <p className="text-text-secondary">Inspetor: {insp.inspector}</p>
                                    </div>
                                    {getStatusBadge(insp.status)}
                                </div>
                                <p className="mt-2 text-text-secondary text-xs italic">"{insp.observations}"</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-text-secondary text-sm">Nenhuma inspeção registrada para este cliente.</p>
                )}
            </Card>

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Cliente">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Nome / Empresa"><Input name="name" required defaultValue={client.name} /></FormField>
                    <FormField label="CNPJ / CPF"><Input name="document" required defaultValue={client.document} /></FormField>
                    <FormField label="Endereço"><Input name="address" required defaultValue={client.address} /></FormField>
                    <FormField label="Cidade"><Input name="city" required defaultValue={client.city} /></FormField>
                    <FormField label="Contato (Telefone)"><Input name="contact" type="tel" required defaultValue={client.contact} /></FormField>
                    <FormField label="Email"><Input name="email" type="email" required defaultValue={client.email} /></FormField>
                    <div className="pt-4 flex justify-end">
                        <Button type="submit">Salvar Alterações</Button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setDeleteModalOpen(false)} 
                onConfirm={() => { onDeleteClient(client.id); setDeleteModalOpen(false); }}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir este cliente? Todos os equipamentos e inspeções associados também serão removidos. Esta ação não pode ser desfeita."
            />
        </div>
    );
};


// --- EQUIPMENTS ---
interface EquipmentsProps {
    equipment: Equipment[];
    clients: Client[];
    onAddEquipment: (equipment: Omit<Equipment, 'id'>) => void;
}
export const Equipments: React.FC<EquipmentsProps> = ({ equipment, clients, onAddEquipment }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClient, setFilterClient] = useState('');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const initialNewEquipmentState = { clientId: '', name: '', serialNumber: '', expiryDate: '', type: '', capacity: '', manufacturer: '', status: InspectionStatus.Agendada };
    const [newEquipment, setNewEquipment] = useState(initialNewEquipmentState);

    const filteredEquipment = useMemo(() =>
        equipment.filter(eq =>
            (eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filterClient === '' || eq.clientId === filterClient)
        ), [searchTerm, filterClient, equipment]);
    
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onAddEquipment(newEquipment);
        setNewEquipment(initialNewEquipmentState);
        setAddModalOpen(false);
    };

    const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Cliente desconhecido';

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input type="text" placeholder="🔍 Buscar por nome ou nº de série..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Select value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
                    <option value="">Todos os Clientes</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
            </div>
            
            <div className="space-y-3">
                {filteredEquipment.length > 0 ? filteredEquipment.map(eq => (
                    <Card key={eq.id}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-text-primary">{eq.name} <span className="text-text-secondary font-normal text-xs">({eq.serialNumber})</span></h4>
                                <p className="text-sm text-text-secondary">{getClientName(eq.clientId)}</p>
                                <p className="text-xs text-text-secondary mt-1">{eq.type} - {eq.capacity} - {eq.manufacturer}</p>
                            </div>
                            {getStatusBadge(eq.status)}
                        </div>
                        <div className="mt-3 pt-3 border-t border-border text-xs flex justify-between">
                             <span className="text-text-secondary">Última Inspeção:</span>
                             <span className="font-semibold text-text-primary">{eq.lastInspectionDate ? new Date(eq.lastInspectionDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                         <div className="text-xs flex justify-between">
                             <span className="text-text-secondary">Vencimento:</span>
                             <span className="font-semibold text-status-reproved">{new Date(eq.expiryDate).toLocaleDateString()}</span>
                        </div>
                    </Card>
                )) : (
                   <EmptyState message="Nenhum equipamento encontrado." icon={<EquipmentIcon className="w-12 h-12"/>} action={
                       <Button onClick={() => setAddModalOpen(true)}>Adicionar Equipamento</Button>
                   } />
                )}
            </div>
            
            <FloatingActionButton onClick={() => setAddModalOpen(true)} icon={<PlusIcon className="w-6 h-6" />} />

            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar Novo Equipamento">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Cliente"><Select name="clientId" required value={newEquipment.clientId} onChange={(e) => setNewEquipment(p => ({...p, clientId: e.target.value}))}><option value="" disabled>Selecione...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormField>
                    <FormField label="Nome do Equipamento"><Input name="name" required value={newEquipment.name} onChange={(e) => setNewEquipment(p => ({...p, name: e.target.value}))} /></FormField>
                    <FormField label="Nº de Série"><Input name="serialNumber" required value={newEquipment.serialNumber} onChange={(e) => setNewEquipment(p => ({...p, serialNumber: e.target.value}))} /></FormField>
                    <FormField label="Data de Validade"><Input name="expiryDate" type="date" required value={newEquipment.expiryDate} onChange={(e) => setNewEquipment(p => ({...p, expiryDate: e.target.value}))} /></FormField>
                    <FormField label="Tipo"><Input name="type" required value={newEquipment.type} onChange={(e) => setNewEquipment(p => ({...p, type: e.target.value}))} /></FormField>
                    <FormField label="Capacidade"><Input name="capacity" required value={newEquipment.capacity} onChange={(e) => setNewEquipment(p => ({...p, capacity: e.target.value}))} /></FormField>
                    <FormField label="Fabricante"><Input name="manufacturer" required value={newEquipment.manufacturer} onChange={(e) => setNewEquipment(p => ({...p, manufacturer: e.target.value}))} /></FormField>
                    <div className="pt-4 flex justify-end">
                        <Button type="submit">Salvar Equipamento</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};


// --- AGENDA ---
type PrefilledInspectionData = {
    clientId?: string;
    date?: string;
    observations?: string;
} | null;

interface AgendaProps {
    inspections: Inspection[];
    clients: Client[];
    onAddInspection: (inspection: Omit<Inspection, 'id'>) => void;
    prefilledData: PrefilledInspectionData;
    onPrefillHandled: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}
export const Agenda: React.FC<AgendaProps> = ({ inspections, clients, onAddInspection, prefilledData, onPrefillHandled, showToast }) => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const initialNewInspectionState = { clientId: '', equipmentIds: [], date: '', inspector: '', observations: '', status: InspectionStatus.Agendada };
    const [newInspection, setNewInspection] = useState(initialNewInspectionState);
    const [isOptimizing, setIsOptimizing] = useState(false);

    useEffect(() => {
        if (prefilledData) {
            setNewInspection(prev => ({
                ...prev,
                clientId: prefilledData.clientId || '',
                date: prefilledData.date || '',
                observations: prefilledData.observations || '',
            }));
            setAddModalOpen(true);
            onPrefillHandled();
        }
    }, [prefilledData, onPrefillHandled]);


    const sortedInspections = useMemo(() =>
        [...inspections].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [inspections]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onAddInspection(newInspection);
        setNewInspection(initialNewInspectionState);
        setAddModalOpen(false);
    };

    const handleOptimizeText = async () => {
        if (!newInspection.observations) {
            showToast("Por favor, insira alguma observação.", "error");
            return;
        }
        setIsOptimizing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Reescreva as seguintes anotações de inspeção de forma profissional, clara e concisa para um relatório técnico. Mantenha o sentido original, mas melhore a gramática, a estrutura e a terminologia. Seja objetivo.\n\nAnotações: "${newInspection.observations}"`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            const optimizedText = response.text;
            setNewInspection(p => ({ ...p, observations: optimizedText }));
            showToast("Texto otimizado com IA!");
        } catch (error) {
            console.error("Gemini API error:", error);
            showToast("Erro ao otimizar o texto.", "error");
        } finally {
            setIsOptimizing(false);
        }
    };

    const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Cliente desconhecido';

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-text-primary px-2">Histórico e Agendamentos</h2>
             <div className="space-y-3">
                {sortedInspections.length > 0 ? sortedInspections.map(insp => (
                    <Card key={insp.id}>
                         <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-text-primary">{getClientName(insp.clientId)}</h4>
                                <p className="text-sm text-text-secondary">Data: {new Date(insp.date).toLocaleDateString()}</p>
                                <p className="text-xs text-text-secondary mt-1">Inspetor: {insp.inspector}</p>
                            </div>
                            {getStatusBadge(insp.status)}
                        </div>
                         <p className="mt-3 pt-3 border-t border-border text-text-secondary text-sm italic">"{insp.observations}"</p>
                    </Card>
                )) : (
                     <EmptyState message="Nenhuma inspeção agendada ou realizada." icon={<AgendaIcon className="w-12 h-12"/>} action={
                       <Button onClick={() => setAddModalOpen(true)}>Agendar Inspeção</Button>
                   } />
                )}
            </div>
            
            <FloatingActionButton onClick={() => setAddModalOpen(true)} icon={<PlusIcon className="w-6 h-6" />} />

            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Agendar Nova Inspeção">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Cliente"><Select name="clientId" required value={newInspection.clientId} onChange={(e) => setNewInspection(p => ({...p, clientId: e.target.value}))}><option value="" disabled>Selecione...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormField>
                    {/* A multi-select for equipment would be better here, but for simplicity we'll omit it */}
                    <FormField label="Data da Inspeção"><Input name="date" type="date" required value={newInspection.date} onChange={(e) => setNewInspection(p => ({...p, date: e.target.value}))} /></FormField>
                    <FormField label="Inspetor Responsável"><Input name="inspector" required value={newInspection.inspector} onChange={(e) => setNewInspection(p => ({...p, inspector: e.target.value}))} /></FormField>
                    <FormField label="Observações Iniciais">
                        <div className="relative">
                            <Textarea name="observations" value={newInspection.observations} onChange={(e) => setNewInspection(p => ({...p, observations: e.target.value}))} />
                             <button type="button" onClick={handleOptimizeText} disabled={isOptimizing} title="Otimizar com IA" className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {isOptimizing ? <SpinnerIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </FormField>
                    <div className="pt-4 flex justify-end">
                        <Button type="submit">Agendar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// --- CERTIFICATES ---
interface CertificatesProps {
    certificates: Certificate[];
    clients: Client[];
}
export const Certificates: React.FC<CertificatesProps> = ({ certificates, clients }) => {
    const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Cliente desconhecido';

    return (
        <div className="p-4 space-y-4">
             <div className="space-y-3">
                {certificates.length > 0 ? certificates.map(cert => (
                    <Card key={cert.id}>
                         <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-text-primary">{getClientName(cert.clientId)}</h4>
                                <p className="text-sm text-text-secondary">Certificado #{cert.id.split('-')[1]}</p>
                            </div>
                             <Button variant="secondary" className="text-xs !px-3 !py-1.5"><DownloadIcon className="w-4 h-4 mr-2" /> Baixar PDF</Button>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border text-xs flex justify-between">
                            <span className="text-text-secondary">Emitido em:</span>
                            <span className="font-semibold text-text-primary">{new Date(cert.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs flex justify-between">
                            <span className="text-text-secondary">Válido até:</span>
                            <span className="font-semibold text-text-primary">{new Date(cert.expiryDate).toLocaleDateString()}</span>
                        </div>
                    </Card>
                )) : (
                    <EmptyState message="Nenhum certificado emitido." icon={<CertificateIcon className="w-12 h-12"/>} />
                )}
            </div>
        </div>
    );
};

// --- FINANCIAL ---
interface FinancialProps {
    financial: FinancialRecord[];
    clients: Client[];
    onAddFinancial: (record: Omit<FinancialRecord, 'id'>) => void;
}
export const Financial: React.FC<FinancialProps> = ({ financial, clients, onAddFinancial }) => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const initialNewRecordState = { clientId: '', inspectionId: '', description: '', value: 0, issueDate: '', dueDate: '', status: PaymentStatus.Pendente };
    const [newRecord, setNewRecord] = useState(initialNewRecordState);
    
    const sortedFinancial = useMemo(() =>
        [...financial].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()),
    [financial]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onAddFinancial(newRecord);
        setNewRecord(initialNewRecordState);
        setAddModalOpen(false);
    };

    const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Cliente desconhecido';
    
    return (
         <div className="p-4 space-y-4">
             <div className="space-y-3">
                {sortedFinancial.length > 0 ? sortedFinancial.map(rec => (
                    <Card key={rec.id}>
                         <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-text-primary">{rec.description}</h4>
                                <p className="text-sm text-text-secondary">{getClientName(rec.clientId)}</p>
                                <p className="text-lg font-bold text-text-primary mt-2">R$ {rec.value.toFixed(2).replace('.', ',')}</p>
                            </div>
                            {getStatusBadge(rec.status)}
                        </div>
                        <div className="mt-3 pt-3 border-t border-border text-xs flex justify-between">
                            <span className="text-text-secondary">Vencimento:</span>
                            <span className="font-semibold text-text-primary">{new Date(rec.dueDate).toLocaleDateString()}</span>
                        </div>
                    </Card>
                )) : (
                     <EmptyState message="Nenhum registro financeiro encontrado." icon={<FinancialIcon className="w-12 h-12"/>} action={
                       <Button onClick={() => setAddModalOpen(true)}>Adicionar Registro</Button>
                   } />
                )}
            </div>
            
            <FloatingActionButton onClick={() => setAddModalOpen(true)} icon={<PlusIcon className="w-6 h-6" />} />

            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar Registro Financeiro">
                 <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Cliente"><Select name="clientId" required value={newRecord.clientId} onChange={(e) => setNewRecord(p => ({...p, clientId: e.target.value}))}><option value="" disabled>Selecione...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormField>
                    {/* A select for inspection would be good here, filtered by client */}
                    <FormField label="Descrição"><Input name="description" required value={newRecord.description} onChange={(e) => setNewRecord(p => ({...p, description: e.target.value}))} /></FormField>
                    <FormField label="Valor (R$)"><Input name="value" type="number" step="0.01" required value={newRecord.value} onChange={(e) => setNewRecord(p => ({...p, value: parseFloat(e.target.value)}))} /></FormField>
                    <FormField label="Data de Emissão"><Input name="issueDate" type="date" required value={newRecord.issueDate} onChange={(e) => setNewRecord(p => ({...p, issueDate: e.target.value}))} /></FormField>
                    <FormField label="Data de Vencimento"><Input name="dueDate" type="date" required value={newRecord.dueDate} onChange={(e) => setNewRecord(p => ({...p, dueDate: e.target.value}))} /></FormField>
                     <FormField label="Status"><Select name="status" required value={newRecord.status} onChange={(e) => setNewRecord(p => ({...p, status: e.target.value as PaymentStatus}))}><option value={PaymentStatus.Pendente}>Pendente</option><option value={PaymentStatus.Pago}>Pago</option></Select></FormField>
                    <div className="pt-4 flex justify-end">
                        <Button type="submit">Salvar Registro</Button>
                    </div>
                </form>
            </Modal>
         </div>
    );
};

// --- REPORTS ---
export const Reports: React.FC<{ equipment: Equipment[], clients: Client[] }> = ({ equipment, clients }) => {
    const [days, setDays] = useState(90);

    const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Desconhecido';

    const expiringSoon = useMemo(() => {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + days);
        return equipment
            .filter(eq => {
                const expiry = new Date(eq.expiryDate);
                return expiry > now && expiry <= futureDate;
            })
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }, [days, equipment]);
    
    const handleExportReport = () => {
        if (typeof (window as any).XLSX === 'undefined') {
            console.error("A biblioteca SheetJS (XLSX) não foi carregada.");
            return;
        }
        const XLSX = (window as any).XLSX;
    
        const reportData = [
            [`Relatório de Equipamentos Vencendo nos Próximos ${days} dias`],
            [],
            ["Nome", "Nº Série", "Cliente", "Data de Validade"],
            ...expiringSoon.map(eq => [
                eq.name,
                eq.serialNumber,
                getClientName(eq.clientId),
                new Date(eq.expiryDate).toLocaleDateString('pt-BR')
            ])
        ];
    
        const ws = XLSX.utils.aoa_to_sheet(reportData);
        ws['!cols'] = [ { wch: 30 }, { wch: 20 }, { wch: 30 }, { wch: 20 } ];
        ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Relatorio Vencimentos");
        XLSX.writeFile(wb, `Relatorio_Vencimentos_${days}dias.xlsx`);
    };

    const TabButton: React.FC<{ value: number; label: string }> = ({ value, label }) => (
        <button
            onClick={() => setDays(value)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors w-full ${days === value ? 'bg-accent text-white shadow' : 'bg-secondary text-text-primary hover:bg-primary'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 space-y-4">
            <Card title="Relatório de Vencimentos" actions={
                <Button onClick={handleExportReport} variant="secondary" className="text-xs !px-3 !py-1.5">
                    <DownloadIcon className="w-4 h-4 mr-2"/> Exportar
                </Button>
            }>
                <div className="p-4 space-y-4">
                    <p className="text-text-secondary text-sm">Filtrar equipamentos vencendo nos próximos:</p>
                    <div className="flex space-x-2 bg-primary p-1 rounded-xl">
                        <TabButton value={30} label="30 dias" />
                        <TabButton value={60} label="60 dias" />
                        <TabButton value={90} label="90 dias" />
                    </div>
                </div>
            </Card>

            <div className="space-y-3">
                {expiringSoon.length > 0 ? expiringSoon.map(eq => (
                    <Card key={eq.id}>
                        <h4 className="font-bold text-text-primary">{eq.name} <span className="text-text-secondary font-normal text-xs">({eq.serialNumber})</span></h4>
                        <p className="text-sm text-text-secondary">{getClientName(eq.clientId)}</p>
                        <div className="mt-3 pt-3 border-t border-border text-xs flex justify-between">
                             <span className="text-text-secondary">Data de Vencimento:</span>
                             <span className="font-semibold text-status-reproved">{new Date(eq.expiryDate).toLocaleDateString()}</span>
                        </div>
                    </Card>
                )) : (
                   <EmptyState message={`Nenhum equipamento vencendo nos próximos ${days} dias.`} icon={<CertificateIcon className="w-12 h-12"/>} />
                )}
            </div>
        </div>
    );
};

// --- SETTINGS ---
type CompanyProfile = { name: string; };
type AppSettings = { notifications: boolean; reminders: boolean; };

interface SettingsProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    profile: CompanyProfile;
    setProfile: (profile: CompanyProfile) => void;
    settings: AppSettings;
    setSettings: (settings: AppSettings) => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
    onLogout: () => void;
}
export const Settings: React.FC<SettingsProps> = ({
    theme, setTheme, profile, setProfile, settings, setSettings, showToast, onLogout
}) => {
    const [companyName, setCompanyName] = useState(profile.name);
    
    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        setProfile({ name: companyName });
        showToast("Perfil da empresa salvo com sucesso!");
    };
    
    return (
        <div className="p-4 space-y-6">
            <Card title="Perfil da Empresa">
                <form onSubmit={handleProfileSave} className="space-y-4">
                    <FormField label="Nome da Empresa">
                        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </FormField>
                    <div className="flex justify-end">
                         <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </Card>

             <Card title="Preferências">
                <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-text-primary">Modo Escuro</span>
                        <ToggleSwitch enabled={theme === 'dark'} onChange={(enabled) => setTheme(enabled ? 'dark' : 'light')} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-text-primary">Ativar Notificações</span>
                         <ToggleSwitch enabled={settings.notifications} onChange={(enabled) => setSettings({ ...settings, notifications: enabled })} />
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-text-primary">Lembretes de Vencimento</span>
                         <ToggleSwitch enabled={settings.reminders} onChange={(enabled) => setSettings({ ...settings, reminders: enabled })} />
                    </div>
                </div>
            </Card>

            <Card title="Conta">
                <div className="space-y-3">
                     <button className="w-full text-left flex justify-between items-center p-3 hover:bg-secondary rounded-lg transition-colors">
                        <div className="flex items-center">
                            <UserCircleIcon className="w-5 h-5 mr-3 text-text-secondary"/>
                            <span className="text-text-primary">Minha Conta</span>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-text-secondary"/>
                     </button>
                      <button onClick={onLogout} className="w-full text-left flex items-center p-3 text-status-reproved hover:bg-secondary rounded-lg transition-colors">
                        <LogoutIcon className="w-5 h-5 mr-3"/>
                        <span>Sair</span>
                     </button>
                </div>
            </Card>
        </div>
    );
};