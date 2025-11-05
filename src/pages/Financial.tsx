import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { PaymentStatus, FinancialRecord, Client } from '../../types';
import { Card, Modal, Button, Input, Select, FormField, EmptyState, FloatingActionButton, FinancialStatusBadge, getFinancialStatus, ConfirmationModal } from '../components/common';
import { FinancialIcon, PlusIcon, EditIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import { parseLocalDate } from '../utils';

type ActiveTab = 'all' | 'recorrente';
type StatusFilter = 'all' | PaymentStatus | 'Atrasado' | 'Condicional';

const MonthNavigator: React.FC<{
    selectedDate: Date;
    onDateChange: (newDate: Date) => void;
}> = ({ selectedDate, onDateChange }) => {

    const changeMonth = (offset: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset, 1); // Set to day 1 to avoid month-end issues
        onDateChange(newDate);
    };
    
    const goToToday = () => {
        onDateChange(new Date());
    };

    return (
        <div className="bg-secondary/70 dark:bg-secondary/70 backdrop-blur-md p-3 rounded-xl shadow-lg dark:shadow-cyan-900/10 border border-border flex items-center justify-between">
            <Button variant="secondary" onClick={() => changeMonth(-1)} className="!p-2.5">
                <ChevronLeftIcon className="w-5 h-5" />
            </Button>
            <div className="text-center">
                 <h2 className="text-lg font-bold text-text-primary capitalize">
                    {selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <Button variant="secondary" onClick={goToToday} className="!p-0 !text-accent !text-xs !bg-transparent !border-none h-auto">
                    Ir para Hoje
                </Button>
            </div>
            <Button variant="secondary" onClick={() => changeMonth(1)} className="!p-2.5">
                <ChevronRightIcon className="w-5 h-5" />
            </Button>
        </div>
    );
};

export const Financial: React.FC<{ showToast: (msg: string, type?: 'success' | 'error') => void }> = ({ showToast }) => {
    const { financial, clients, handleAddFinancial, handleUpdateFinancial, handleDeleteFinancial, handleUpdateClient } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    
    // New state for filters
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<ActiveTab>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    // Effect to auto-update month view
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            if (now.getMonth() !== selectedDate.getMonth() || now.getFullYear() !== selectedDate.getFullYear()) {
                setSelectedDate(now);
            }
        }, 60 * 1000); // Check every minute
        return () => clearInterval(interval);
    }, [selectedDate]);
    
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
    
    const displayedRecords = useMemo(() => {
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();

        if (activeTab === 'recorrente') {
            const recurringClients = clients.filter(c => c.isRecurring);
            
            return recurringClients.map(client => {
                const startDate = parseLocalDate(client.recurringCycleStart || '1970-01-01');
                const startYear = startDate.getFullYear();
                const startMonth = startDate.getMonth();

                // Calculate month difference
                const monthOffset = (selectedYear - startYear) * 12 + (selectedMonth - startMonth);
                const installmentNumber = monthOffset + 1;

                // Check if this installment is valid
                if (monthOffset < 0 || installmentNumber > (client.recurringInstallments || 0)) {
                    return null;
                }

                // Check if a real record for this installment already exists
                const existingRecordId = `recorrente-${client.id}-${installmentNumber}`;
                const existingRecord = financial.find(f => f.inspectionId === existingRecordId);
                
                if (existingRecord) {
                    return existingRecord; // Return the actual paid record
                }
                
                // Generate a virtual record for display
                const dueDate = new Date(startYear, startMonth + monthOffset, startDate.getDate());

                return {
                    id: `virtual-${client.id}-${installmentNumber}`,
                    clientId: client.id,
                    inspectionId: existingRecordId,
                    description: `Pagamento Recorrente - Parcela ${installmentNumber}/${client.recurringInstallments}`,
                    value: client.recurringAmount || 0,
                    issueDate: new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0],
                    dueDate: dueDate.toISOString().split('T')[0],
                    status: PaymentStatus.Pendente,
                    isVirtual: true,
                };
            }).filter(Boolean) as (FinancialRecord & { isVirtual?: boolean })[];
        }

        // Logic for 'all' tab
        let records = financial.filter(rec => !rec.inspectionId.startsWith('recorrente-'));
        
        // Filter by month
        records = records.filter(rec => {
            if (!rec.dueDate && !rec.isConditionalDueDate) return false;
            // Include conditional items regardless of month unless they are paid.
            if (rec.isConditionalDueDate) {
                if (rec.status === PaymentStatus.Pago && rec.paymentDate) {
                    const paymentDate = parseLocalDate(rec.paymentDate);
                    return paymentDate.getFullYear() === selectedYear && paymentDate.getMonth() === selectedMonth;
                }
                 return true; // Show all pending conditional
            }
            const dueDate = parseLocalDate(rec.dueDate);
            return dueDate.getFullYear() === selectedYear && dueDate.getMonth() === selectedMonth;
        });

        // Apply status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'Condicional') {
                return records.filter(rec => rec.isConditionalDueDate && rec.status === PaymentStatus.Pendente);
            }
            records = records.filter(rec => getFinancialStatus(rec) === statusFilter);
        }
        
        return records.sort((a,b) => (a.dueDate && b.dueDate) ? parseLocalDate(a.dueDate).getTime() - parseLocalDate(b.dueDate).getTime() : 0);

    }, [financial, clients, selectedDate, activeTab, statusFilter]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRecord) {
            handleUpdateFinancial({ ...formState, id: editingRecord.id });
        } else {
            handleAddFinancial(formState);
        }
        setModalOpen(false);
    };

    const handlePayRecurring = (client: Client, installmentNumber: number, dueDate: string) => {
        const newRecord: Omit<FinancialRecord, 'id'> = {
            clientId: client.id,
            inspectionId: `recorrente-${client.id}-${installmentNumber}`,
            description: `Pagamento Recorrente - Parcela ${installmentNumber}/${client.recurringInstallments}`,
            value: client.recurringAmount || 0,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: dueDate,
            paymentDate: new Date().toISOString().split('T')[0],
            status: PaymentStatus.Pago
        };
        handleAddFinancial(newRecord);
        showToast('Pagamento recorrente registrado!');
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
            // Check if it was a recurring payment to potentially adjust client data
            if (editingRecord.inspectionId.startsWith('recorrente-')) {
                const client = clients.find(c => c.id === editingRecord.clientId);
                if (client) {
                     // The logic here is complex if payments are out of order.
                     // For now, we just delete the record. The virtual record will reappear.
                     // A more advanced system would decrement a counter.
                     showToast('Parcela recorrente excluída.', 'success');
                }
            }
            handleDeleteFinancial(editingRecord.id);
        }
        setDeleteConfirmOpen(false);
        setEditingRecord(null);
    };


    return (
        <div className="p-4 space-y-6">
            <MonthNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

            <div className="border-b border-border flex">
                <button onClick={() => setActiveTab('all')} className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'all' ? 'border-accent text-accent' : 'border-transparent text-text-secondary'}`}>Todos</button>
                <button onClick={() => setActiveTab('recorrente')} className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'recorrente' ? 'border-accent text-accent' : 'border-transparent text-text-secondary'}`}>Recorrente</button>
            </div>
            
            {activeTab === 'all' && (
                 <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                    {(['all', PaymentStatus.Pendente, 'Atrasado', 'Condicional', PaymentStatus.Pago] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
                                statusFilter === status 
                                ? 'bg-accent text-white' 
                                : 'bg-secondary/70 text-text-secondary hover:bg-secondary'
                            }`}
                        >
                            {status === 'all' ? 'Todos' : status}
                        </button>
                    ))}
                </div>
            )}

            <div className="space-y-4">
                {displayedRecords.length > 0 ? displayedRecords.map(rec => {
                    const client = clients.find(c => c.id === rec.clientId);
                    const isVirtual = 'isVirtual' in rec && rec.isVirtual;

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
                                        <span className="w-3 h-3 mr-1.5" />
                                        {rec.isConditionalDueDate ? (
                                            <span>{rec.dueDateCondition}</span>
                                        ) : (
                                            <span>Venc.: {rec.dueDate ? parseLocalDate(rec.dueDate).toLocaleDateString() : 'N/A'}</span>
                                        )}
                                    </div>
                                    <FinancialStatusBadge record={rec} />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-2 border-t border-border pt-2">
                                {isVirtual ? (
                                    <Button onClick={() => handlePayRecurring(client!, parseInt(rec.inspectionId.split('-').pop()!), rec.dueDate!)} variant="secondary" className="!py-1.5 !px-4 !text-xs">
                                        Marcar como Pago
                                    </Button>
                                ) : (
                                    <>
                                        <button onClick={() => openModal(rec as FinancialRecord)} className="p-1.5 hover:bg-primary rounded-full"><EditIcon className="w-4 h-4" /></button>
                                        <button onClick={() => openDeleteConfirm(rec as FinancialRecord)} className="p-1.5 hover:bg-primary rounded-full text-status-reproved"><TrashIcon className="w-4 h-4" /></button>
                                    </>
                                )}
                            </div>
                        </Card>
                    );
                }) : <EmptyState message="Nenhum registro financeiro para este período/filtro." icon={<FinancialIcon className="w-12 h-12" />} action={<Button onClick={() => openModal()}>Adicionar Registro</Button>}/>}
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