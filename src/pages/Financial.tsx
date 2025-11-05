import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { PaymentStatus, FinancialRecord } from '../../types';
import { Card, Modal, Button, Input, Select, FormField, EmptyState, FloatingActionButton, FinancialStatusBadge, getFinancialStatus, ConfirmationModal } from '../components/common';
import { FinancialIcon, PlusIcon, AgendaIcon, EditIcon, TrashIcon } from '../components/Icons';
import { parseLocalDate } from '../utils';

type FinancialStatusFilter = PaymentStatus | 'Atrasado' | 'Condicional' | 'Recorrente' | 'all';

const StatusFilter: React.FC<{
    selectedStatus: FinancialStatusFilter;
    onStatusChange: (status: FinancialStatusFilter) => void;
}> = ({ selectedStatus, onStatusChange }) => {
    const statuses: FinancialStatusFilter[] = ['all', PaymentStatus.Pendente, 'Atrasado', 'Condicional', 'Recorrente', PaymentStatus.Pago];
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

export const Financial: React.FC<{ showToast: (msg: string, type?: 'success' | 'error') => void }> = ({ showToast }) => {
    const { financial, clients, handleAddFinancial, handleUpdateFinancial, handleDeleteFinancial, handleMarkInstallmentAsPaid, handleUpdateClient } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [filter, setFilter] = useState<FinancialStatusFilter>('all');
    const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    
    const initialRecordState: Omit<FinancialRecord, 'id'> = { clientId: '', inspectionId: '', description: '', value: 0, issueDate: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0], status: PaymentStatus.Pendente, paymentDate: '', isConditionalDueDate: false, dueDateCondition: '' };
    const [formState, setFormState] = useState(initialRecordState);
    const [dueDateType, setDueDateType] = useState<'fixed' | 'delivery'>('fixed');

    useEffect(() => {
        if (isModalOpen) {
            if (editingRecord) {
                setFormState({
                    ...editingRecord,
                    paymentDate: editingRecord.paymentDate || '',
                    isConditionalDueDate: editingRecord.isConditionalDueDate || false,
                    dueDateCondition: editingRecord.dueDateCondition || '',
                });
                if (editingRecord.isConditionalDueDate) {
                    setDueDateType('delivery');
                } else {
                    setDueDateType('fixed');
                }
            } else {
                const today = new Date().toISOString().split('T')[0];
                setFormState({ ...initialRecordState, issueDate: today, dueDate: today });
                setDueDateType('fixed');
            }
        }
    }, [isModalOpen, editingRecord]);
    
    const financialSummary = financial.reduce((acc, record) => {
        if (record.status === PaymentStatus.Pago) acc.received += record.value;
        if (record.status === PaymentStatus.Pendente) acc.pending += record.value;
        return acc;
    }, { received: 0, pending: 0 });

    const filteredFinancial = useMemo(() => {
        const recurringVirtualRecords: (FinancialRecord & { isRecurringPayment?: boolean })[] = clients
            .filter(c =>
                c.isRecurring &&
                c.recurringInstallments !== undefined &&
                c.paidInstallments !== undefined &&
                c.paidInstallments < c.recurringInstallments
            )
            .map(client => {
                const cycleStartDate = parseLocalDate(client.recurringCycleStart || new Date().toISOString());
                const currentPaidInstallments = client.paidInstallments || 0;
                
                const targetMonth = cycleStartDate.getMonth() + currentPaidInstallments;
                let dueDate = new Date(cycleStartDate.getFullYear(), targetMonth, cycleStartDate.getDate());
                
                if (dueDate.getDate() !== cycleStartDate.getDate()) {
                    dueDate = new Date(cycleStartDate.getFullYear(), targetMonth + 1, 0);
                }

                const currentInstallment = currentPaidInstallments + 1;

                return {
                    id: `rec-${client.id}`, // Temporary unique ID for rendering
                    clientId: client.id,
                    inspectionId: `recorrente-${client.id}-${currentInstallment}`,
                    description: `Pagamento Recorrente - Parcela ${currentInstallment}/${client.recurringInstallments}`,
                    value: client.recurringAmount || 0,
                    issueDate: new Date().toISOString().split('T')[0],
                    dueDate: dueDate.toISOString().split('T')[0],
                    status: PaymentStatus.Pendente,
                    isRecurringPayment: true,
                };
            });

        switch (filter) {
            case 'all':
                 return [...financial, ...recurringVirtualRecords].sort((a,b) => (a.dueDate && b.dueDate) ? parseLocalDate(a.dueDate).getTime() - parseLocalDate(b.dueDate).getTime() : 0);
            case 'Condicional':
                return financial.filter(rec => rec.isConditionalDueDate && rec.status === PaymentStatus.Pendente);
            case 'Recorrente':
                return recurringVirtualRecords;
            case 'Pendente':
                 return [
                    ...financial.filter(rec => getFinancialStatus(rec) === 'Pendente' && !rec.isConditionalDueDate),
                    ...recurringVirtualRecords
                ].sort((a,b) => (a.dueDate && b.dueDate) ? parseLocalDate(a.dueDate).getTime() - parseLocalDate(b.dueDate).getTime() : 0);
            default: // Handles 'Atrasado' and 'Pago'
                return financial.filter(rec => getFinancialStatus(rec) === filter);
        }
    }, [financial, filter, clients]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRecord) {
            handleUpdateFinancial({ ...formState, id: editingRecord.id });
        } else {
            handleAddFinancial(formState);
        }
        setModalOpen(false);
    };

    const openModal = (rec: FinancialRecord | null = null) => {
        setEditingRecord(rec);
        setModalOpen(true);
    };

    const openDeleteConfirm = (rec: FinancialRecord) => {
        setEditingRecord(rec);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (editingRecord) {
            if (editingRecord.inspectionId.startsWith('recorrente-')) {
                const client = clients.find(c => c.id === editingRecord.clientId);
                if (client && client.isRecurring && (client.paidInstallments || 0) > 0) {
                     handleUpdateClient({
                        ...client,
                        paidInstallments: (client.paidInstallments || 0) - 1,
                    });
                     showToast('Parcela estornada do cliente.', 'success');
                }
            }
            handleDeleteFinancial(editingRecord.id);
        }
        setDeleteConfirmOpen(false);
        setEditingRecord(null);
    };

    const handlePaymentConfirmation = (clientId: string) => {
        handleMarkInstallmentAsPaid(clientId);
        showToast('Pagamento recorrente registrado com sucesso!', 'success');
    };

    return (
        <div className="p-4 space-y-6">
            <Card title="💰 Resumo Financeiro" collapsible>
               <FinancialChart received={financialSummary.received} pending={financialSummary.pending} />
            </Card>

            <div>
                <StatusFilter selectedStatus={filter} onStatusChange={setFilter} />
            </div>

            <div className="space-y-4">
                {filteredFinancial.length > 0 ? filteredFinancial.map(rec => {
                    const client = clients.find(c => c.id === rec.clientId);
                    const isRecurringPayment = 'isRecurringPayment' in rec && rec.isRecurringPayment;
                    return (
                        <Card key={rec.id}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-text-primary">R$ {rec.value.toFixed(2).replace('.', ',')}</h4>
                                    <p className="text-sm text-text-secondary">{rec.description}</p>
                                    <p className="text-xs text-text-secondary">{client?.name}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <div className="flex items-center justify-end text-xs text-text-secondary mb-1">
                                        <AgendaIcon className="w-3 h-3 mr-1.5" />
                                        {rec.isConditionalDueDate ? (
                                            <span>Vencimento: {rec.dueDateCondition}</span>
                                        ) : (
                                            <span>Vencimento: {rec.dueDate ? parseLocalDate(rec.dueDate).toLocaleDateString() : 'N/A'}</span>
                                        )}
                                    </div>
                                    <FinancialStatusBadge record={rec} />
                                </div>
                            </div>
                             {isRecurringPayment ? (
                                <div className="flex justify-end mt-2 border-t border-border pt-2">
                                    <Button onClick={() => handlePaymentConfirmation(rec.clientId)} variant="secondary" className="!py-1.5 !px-4 !text-xs">
                                        Marcar como Pago
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex justify-end space-x-2 mt-2 border-t border-border pt-2">
                                    <button onClick={() => openModal(rec as FinancialRecord)} className="p-1.5 hover:bg-primary rounded-full"><EditIcon className="w-4 h-4" /></button>
                                    <button onClick={() => openDeleteConfirm(rec as FinancialRecord)} className="p-1.5 hover:bg-primary rounded-full text-status-reproved"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            )}
                        </Card>
                    );
                }) : <EmptyState message="Nenhum registro financeiro para este filtro." icon={<FinancialIcon className="w-12 h-12" />} action={<Button onClick={() => openModal()}>Adicionar Registro</Button>}/>}
            </div>
             <FloatingActionButton onClick={() => openModal()} icon={<PlusIcon />} />
             <Modal isOpen={isModalOpen} onClose={() => { setModalOpen(false); setEditingRecord(null); }} title={editingRecord ? "Editar Conta a Receber" : "Adicionar Conta a Receber"}>
                 <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Cliente">
                        <Select name="clientId" value={formState.clientId} onChange={e => setFormState(p => ({...p, clientId: e.target.value}))} required>
                            <option value="">Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </FormField>
                    <FormField label="Descrição"><Input value={formState.description} onChange={e => setFormState(p => ({...p, description: e.target.value}))} required/></FormField>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Valor (R$)"><Input type="number" step="0.01" value={formState.value} onChange={e => setFormState(p => ({...p, value: parseFloat(e.target.value)}))} required /></FormField>
                        <FormField label="Data de Emissão"><Input type="date" value={formState.issueDate} onChange={e => setFormState(p => ({...p, issueDate: e.target.value}))} required /></FormField>
                    </div>

                    <FormField label="Opção de Vencimento">
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <Button
                                type="button"
                                variant={dueDateType === 'fixed' ? 'primary' : 'secondary'}
                                onClick={() => {
                                    setDueDateType('fixed');
                                    setFormState(p => ({
                                        ...p,
                                        isConditionalDueDate: false,
                                        dueDateCondition: '',
                                        dueDate: p.dueDate || new Date().toISOString().split('T')[0],
                                    }));
                                }}
                                className="!py-2"
                            >
                                Data Fixa
                            </Button>
                            <Button
                                type="button"
                                variant={dueDateType === 'delivery' ? 'primary' : 'secondary'}
                                onClick={() => {
                                    setDueDateType('delivery');
                                    setFormState(p => ({
                                        ...p,
                                        isConditionalDueDate: true,
                                        dueDateCondition: 'Na Entrega',
                                        dueDate: '',
                                    }));
                                }}
                                className="!py-2"
                            >
                                Na Entrega
                            </Button>
                        </div>
                    </FormField>

                    {dueDateType === 'fixed' && (
                         <div className="animate-fade-in">
                            <FormField label="Data de Vencimento">
                                <Input
                                    type="date"
                                    value={formState.dueDate}
                                    onChange={e => setFormState(p => ({ ...p, dueDate: e.target.value }))}
                                    required
                                />
                            </FormField>
                        </div>
                    )}

                     <FormField label="Status">
                        <Select value={formState.status} onChange={e => setFormState(p => ({...p, status: e.target.value as PaymentStatus}))}>
                            <option value={PaymentStatus.Pendente}>Pendente</option>
                            <option value={PaymentStatus.Pago}>Pago</option>
                        </Select>
                    </FormField>
                     {formState.status === PaymentStatus.Pago && (
                         <div className="animate-fade-in">
                            <FormField label="Data de Recebimento"><Input type="date" value={formState.paymentDate} onChange={e => setFormState(p => ({...p, paymentDate: e.target.value}))} /></FormField>
                         </div>
                    )}
                    <div className="flex justify-end pt-4"><Button type="submit">{editingRecord ? 'Salvar Alterações' : 'Salvar Registro'}</Button></div>
                 </form>
             </Modal>
              <ConfirmationModal 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir o registro "${editingRecord?.description}"?`}
            />
        </div>
    );
};