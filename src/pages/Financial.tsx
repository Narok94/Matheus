import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { PaymentStatus, FinancialRecord, Client } from '../../types';
import { Card, Modal, Button, Input, Select, FormField, EmptyState, FloatingActionButton, FinancialStatusBadge, getFinancialStatus, ConfirmationModalWithSeriesDelete, ToggleSwitch } from '../components/common';
import { FinancialIcon, PlusIcon, AgendaIcon, EditIcon, TrashIcon } from '../components/Icons';
import { parseLocalDate } from '../utils';

type FinancialStatusFilter = PaymentStatus | 'Atrasado' | 'Condicional' | 'all';

type RecurrenceFormState = {
    isRecurring: boolean;
    frequency: 'monthly' | 'quarterly' | 'annually';
    durationType: 'installments' | 'date' | 'indefinite';
    installments: number;
    endDate: string;
}

const StatusFilter: React.FC<{
    selectedStatus: FinancialStatusFilter;
    onStatusChange: (status: FinancialStatusFilter) => void;
}> = ({ selectedStatus, onStatusChange }) => {
    const statuses: FinancialStatusFilter[] = ['all', PaymentStatus.Pendente, 'Atrasado', 'Condicional', PaymentStatus.Pago];
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

export const Financial: React.FC = () => {
    const { financial, clients, handleAddFinancial, handleAddFinancials, handleUpdateFinancial, handleDeleteFinancial, handleDeleteFinancialSeries } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [filter, setFilter] = useState<FinancialStatusFilter>('all');
    const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
    const [recordToDelete, setRecordToDelete] = useState<FinancialRecord | null>(null);
    
    const initialRecordState: Omit<FinancialRecord, 'id'> = { clientId: '', inspectionId: '', description: '', value: 0, issueDate: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0], status: PaymentStatus.Pendente, paymentDate: '', isConditionalDueDate: false, dueDateCondition: '' };
    const [formState, setFormState] = useState(initialRecordState);
    const [recurrenceState, setRecurrenceState] = useState<RecurrenceFormState>({ isRecurring: false, frequency: 'monthly', durationType: 'installments', installments: 12, endDate: ''});

    useEffect(() => {
        if (isModalOpen) {
            setRecurrenceState({ isRecurring: false, frequency: 'monthly', durationType: 'installments', installments: 12, endDate: ''});
            if (editingRecord) {
                setFormState({
                    ...editingRecord,
                    paymentDate: editingRecord.paymentDate || '',
                    isConditionalDueDate: editingRecord.isConditionalDueDate || false,
                    dueDateCondition: editingRecord.dueDateCondition || '',
                });
            } else {
                const today = new Date().toISOString().split('T')[0];
                setFormState({ ...initialRecordState, issueDate: today, dueDate: today });
            }
        }
    }, [isModalOpen, editingRecord]);
    
    const financialSummary = financial.reduce((acc, record) => {
        if (record.status === PaymentStatus.Pago) acc.received += record.value;
        if (record.status === PaymentStatus.Pendente) acc.pending += record.value;
        return acc;
    }, { received: 0, pending: 0 });

    const filteredFinancial = useMemo(() => {
        switch (filter) {
            case 'all':
                return financial;
            case 'Condicional':
                return financial.filter(rec => rec.isConditionalDueDate && rec.status === PaymentStatus.Pendente);
            case 'Pendente':
                return financial.filter(rec => getFinancialStatus(rec) === 'Pendente' && !rec.isConditionalDueDate);
            default: // Handles 'Atrasado' and 'Pago'
                return financial.filter(rec => getFinancialStatus(rec) === filter);
        }
    }, [financial, filter]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (recurrenceState.isRecurring && !editingRecord) {
            // Generate multiple records
            const recordsToCreate: Omit<FinancialRecord, 'id'>[] = [];
            const recurringGroupId = crypto.randomUUID();
            const startDate = parseLocalDate(formState.dueDate);
            let totalInstallments = 0;

            if (recurrenceState.durationType === 'installments') {
                totalInstallments = recurrenceState.installments;
            } else if (recurrenceState.durationType === 'date') {
                const endDate = parseLocalDate(recurrenceState.endDate);
                let count = 0;
                let currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    count++;
                    if (recurrenceState.frequency === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);
                    else if (recurrenceState.frequency === 'quarterly') currentDate.setMonth(currentDate.getMonth() + 3);
                    else if (recurrenceState.frequency === 'annually') currentDate.setFullYear(currentDate.getFullYear() + 1);
                }
                totalInstallments = count;
            } else { // indefinite
                totalInstallments = 60; // 5 years
            }
            
            for (let i = 0; i < totalInstallments; i++) {
                const newDueDate = new Date(startDate);
                if (recurrenceState.frequency === 'monthly') newDueDate.setMonth(startDate.getMonth() + i);
                else if (recurrenceState.frequency === 'quarterly') newDueDate.setMonth(startDate.getMonth() + i * 3);
                else if (recurrenceState.frequency === 'annually') newDueDate.setFullYear(startDate.getFullYear() + i);
                
                recordsToCreate.push({
                    ...formState,
                    description: `${formState.description} (${recurrenceState.durationType !== 'indefinite' ? `Parcela ${i+1}/${totalInstallments}` : `Recorrente`})`,
                    dueDate: newDueDate.toISOString().split('T')[0],
                    status: PaymentStatus.Pendente,
                    paymentDate: '',
                    recurringGroupId,
                    recurringInstance: i + 1,
                    recurringTotalInstances: recurrenceState.durationType !== 'indefinite' ? totalInstallments : undefined,
                });
            }
            handleAddFinancials(recordsToCreate);

        } else if (editingRecord) {
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
        setRecordToDelete(rec);
    };

    const confirmDeleteSingle = () => {
        if (recordToDelete) {
            handleDeleteFinancial(recordToDelete.id);
        }
        setRecordToDelete(null);
    };

    const confirmDeleteSeries = () => {
        if (recordToDelete?.recurringGroupId && recordToDelete?.recurringInstance) {
            handleDeleteFinancialSeries(recordToDelete.recurringGroupId, recordToDelete.recurringInstance);
        }
        setRecordToDelete(null);
    }

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
                                            <span>Vencimento: {parseLocalDate(rec.dueDate).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                    <FinancialStatusBadge record={rec} />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-2 border-t border-border pt-2">
                                <button onClick={() => openModal(rec)} className="p-1.5 hover:bg-primary rounded-full" disabled={!!rec.recurringGroupId}><EditIcon className={rec.recurringGroupId ? 'text-gray-400' : ''}/></button>
                                <button onClick={() => openDeleteConfirm(rec)} className="p-1.5 hover:bg-primary rounded-full text-status-reproved"><TrashIcon className="w-4 h-4" /></button>
                            </div>
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

                    {!editingRecord && (
                        <div className="pt-2 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-primary/50 rounded-lg">
                                <label className="text-sm font-medium text-text-secondary">É uma transação recorrente?</label>
                                <ToggleSwitch enabled={recurrenceState.isRecurring} onChange={enabled => setRecurrenceState(p => ({...p, isRecurring: enabled}))} />
                            </div>
                            {recurrenceState.isRecurring && (
                                <div className="p-4 border border-border rounded-lg space-y-4 animate-fade-in">
                                    <p className="text-xs text-text-secondary">A data de vencimento abaixo será usada como data de início para a primeira parcela.</p>
                                    <FormField label="Frequência">
                                        <Select value={recurrenceState.frequency} onChange={e => setRecurrenceState(p => ({...p, frequency: e.target.value as any}))}>
                                            <option value="monthly">Mensal</option>
                                            <option value="quarterly">Trimestral</option>
                                            <option value="annually">Anual</option>
                                        </Select>
                                    </FormField>
                                    <FormField label="Duração">
                                        <div className="flex space-x-4">
                                            <label className="flex items-center"><input type="radio" name="durationType" value="installments" checked={recurrenceState.durationType === 'installments'} onChange={e => setRecurrenceState(p => ({...p, durationType: e.target.value as any}))} className="mr-2"/> N° de Parcelas</label>
                                            <label className="flex items-center"><input type="radio" name="durationType" value="date" checked={recurrenceState.durationType === 'date'} onChange={e => setRecurrenceState(p => ({...p, durationType: e.target.value as any}))} className="mr-2"/> Data Final</label>
                                            <label className="flex items-center"><input type="radio" name="durationType" value="indefinite" checked={recurrenceState.durationType === 'indefinite'} onChange={e => setRecurrenceState(p => ({...p, durationType: e.target.value as any}))} className="mr-2"/> Indefinido</label>
                                        </div>
                                    </FormField>
                                    {recurrenceState.durationType === 'installments' && <FormField label="Total de Parcelas"><Input type="number" value={recurrenceState.installments} onChange={e => setRecurrenceState(p => ({...p, installments: parseInt(e.target.value, 10) || 1}))} /></FormField>}
                                    {recurrenceState.durationType === 'date' && <FormField label="Data Final"><Input type="date" value={recurrenceState.endDate} onChange={e => setRecurrenceState(p => ({...p, endDate: e.target.value}))} /></FormField>}
                                    {recurrenceState.durationType === 'indefinite' && <p className="text-xs text-text-secondary p-2 bg-primary/50 rounded-md">Serão geradas cobranças para os próximos 5 anos.</p>}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <FormField label="Data de Vencimento"><Input type="date" value={formState.dueDate} onChange={e => setFormState(p => ({...p, dueDate: e.target.value}))} required /></FormField>

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
              <ConfirmationModalWithSeriesDelete 
                isOpen={!!recordToDelete}
                onClose={() => setRecordToDelete(null)}
                onConfirmSingle={confirmDeleteSingle}
                onConfirmSeries={confirmDeleteSeries}
                title="Confirmar Exclusão"
                message={
                    recordToDelete?.recurringGroupId ? (
                        <p>Este registro faz parte de uma série recorrente. Você deseja excluir apenas esta instância ou esta e todas as futuras cobranças <strong className="text-status-reproved">pendentes</strong>?</p>
                    ) : (
                        `Tem certeza que deseja excluir o registro "${recordToDelete?.description}"?`
                    )
                }
            />
        </div>
    );
};