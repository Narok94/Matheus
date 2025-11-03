import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { PaymentStatus, FinancialRecord, Client } from '../../types';
import { Card, Modal, Button, Input, Select, FormField, EmptyState, FloatingActionButton, FinancialStatusBadge, getFinancialStatus } from '../components/common';
import { FinancialIcon, PlusIcon } from '../components/Icons';

type FinancialStatusFilter = PaymentStatus | 'Atrasado' | 'all';

const StatusFilter: React.FC<{
    selectedStatus: FinancialStatusFilter;
    onStatusChange: (status: FinancialStatusFilter) => void;
}> = ({ selectedStatus, onStatusChange }) => {
    const statuses: FinancialStatusFilter[] = ['all', PaymentStatus.Pendente, PaymentStatus.Pago, 'Atrasado'];
    return (
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
            {statuses.map(status => (
                <button
                    key={status}
                    onClick={() => onStatusChange(status)}
                    className={`px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
                        selectedStatus === status 
                        ? 'bg-accent text-white' 
                        : 'bg-secondary/70 text-text-secondary hover:bg-secondary'
                    }`}
                >
                    {status === 'all' ? 'Todos' : status}
                </button>
            ))}
        </div>
    );
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

const RecurringPayments: React.FC<{
    clients: Client[];
    onMarkAsPaid: (clientId: string) => void;
}> = ({ clients, onMarkAsPaid }) => {
    const recurringClients = clients.filter(c =>
        c.isRecurring &&
        c.recurringInstallments !== undefined &&
        c.paidInstallments !== undefined &&
        c.paidInstallments < c.recurringInstallments
    );

    if (recurringClients.length === 0) {
        return <p className="text-text-secondary text-sm">Nenhum pagamento recorrente pendente.</p>;
    }

    return (
        <div className="space-y-3">
            {recurringClients.map(client => {
                const currentInstallment = (client.paidInstallments || 0) + 1;
                const totalInstallments = client.recurringInstallments || 0;
                
                const dueDate = new Date(client.recurringCycleStart || new Date());
                dueDate.setMonth(dueDate.getMonth() + (client.paidInstallments || 0));
                dueDate.setDate(new Date(client.recurringCycleStart || new Date()).getDate());

                return (
                    <div key={client.id} className="p-3 bg-primary rounded-lg border border-border">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-text-primary">{client.name}</p>
                                <p className="text-sm text-text-secondary">R$ {client.recurringAmount?.toFixed(2).replace('.', ',')}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-text-primary">Parcela {currentInstallment}/{totalInstallments}</p>
                                <p className="text-xs text-text-secondary">Venc.: {dueDate.toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-2">
                            <Button onClick={() => onMarkAsPaid(client.id)} variant="secondary" className="!py-1.5 !px-4 !text-xs">
                                Marcar como Pago
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


export const Financial: React.FC = () => {
    const { financial, clients, handleAddFinancial, handleMarkInstallmentAsPaid } = useData();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [filter, setFilter] = useState<FinancialStatusFilter>('all');
    
    const initialRecordState: Omit<FinancialRecord, 'id'> = { clientId: '', inspectionId: '', description: '', value: 0, issueDate: '', dueDate: '', status: PaymentStatus.Pendente, paymentDate: '' };
    const [newRecord, setNewRecord] = useState(initialRecordState);
    
    const financialSummary = financial.reduce((acc, record) => {
        if (record.status === PaymentStatus.Pago) acc.received += record.value;
        if (record.status === PaymentStatus.Pendente) acc.pending += record.value;
        return acc;
    }, { received: 0, pending: 0 });

    const filteredFinancial = useMemo(() => {
        if (filter === 'all') return financial;
        return financial.filter(rec => getFinancialStatus(rec) === filter);
    }, [financial, filter]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddFinancial(newRecord);
        setNewRecord(initialRecordState);
        setAddModalOpen(false);
    };

    return (
        <div className="p-4 space-y-6">
            <Card title="Pagamentos Recorrentes" collapsible>
                <RecurringPayments clients={clients} onMarkAsPaid={handleMarkInstallmentAsPaid} />
            </Card>

            <Card title="💰 Resumo Financeiro" collapsible>
               <FinancialChart received={financialSummary.received} pending={financialSummary.pending} />
            </Card>

            <div>
                <StatusFilter selectedStatus={filter} onStatusChange={setFilter} />
            </div>

            <div className="space-y-4">
                {filteredFinancial.length > 0 ? filteredFinancial.map(rec => {
                    const client = clients.find(c => c.id === rec.clientId);
                    return (
                        <Card key={rec.id}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-text-primary">R$ {rec.value.toFixed(2).replace('.', ',')}</h4>
                                    <p className="text-sm text-text-secondary">{rec.description}</p>
                                    <p className="text-xs text-text-secondary">{client?.name}</p>
                                </div>
                                <FinancialStatusBadge record={rec} />
                            </div>
                        </Card>
                    );
                }) : <EmptyState message="Nenhum registro financeiro para este filtro." icon={<FinancialIcon className="w-12 h-12" />} action={<Button onClick={() => setAddModalOpen(true)}>Adicionar Registro</Button>}/>}
            </div>
             <FloatingActionButton onClick={() => setAddModalOpen(true)} icon={<PlusIcon />} />
             <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar Contas a Receber">
                 <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Cliente">
                        <Select name="clientId" value={newRecord.clientId} onChange={e => setNewRecord(p => ({...p, clientId: e.target.value}))} required>
                            <option value="">Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </FormField>
                    <FormField label="Descrição"><Input value={newRecord.description} onChange={e => setNewRecord(p => ({...p, description: e.target.value}))} required/></FormField>
                    <FormField label="Valor (R$)"><Input type="number" step="0.01" value={newRecord.value} onChange={e => setNewRecord(p => ({...p, value: parseFloat(e.target.value)}))} required /></FormField>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Data de Emissão"><Input type="date" value={newRecord.issueDate} onChange={e => setNewRecord(p => ({...p, issueDate: e.target.value}))} required /></FormField>
                        <FormField label="Data de Vencimento"><Input type="date" value={newRecord.dueDate} onChange={e => setNewRecord(p => ({...p, dueDate: e.target.value}))} required /></FormField>
                    </div>
                     <FormField label="Status">
                        <Select value={newRecord.status} onChange={e => setNewRecord(p => ({...p, status: e.target.value as PaymentStatus}))}>
                            <option value={PaymentStatus.Pendente}>Pendente</option>
                            <option value={PaymentStatus.Pago}>Pago</option>
                        </Select>
                    </FormField>
                     {newRecord.status === PaymentStatus.Pago && (
                        <FormField label="Data de Recebimento"><Input type="date" value={newRecord.paymentDate} onChange={e => setNewRecord(p => ({...p, paymentDate: e.target.value}))} /></FormField>
                    )}
                    <div className="flex justify-end pt-4"><Button type="submit">Salvar Registro</Button></div>
                 </form>
             </Modal>
        </div>
    );
};