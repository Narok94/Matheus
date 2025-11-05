import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card, EmptyState, FloatingActionButton, Modal, FormField, Input, Select, Button, ConfirmationModal, FinancialStatusBadge, getFinancialStatus } from '../components/common';
import { ArrowUpCircleIcon, PlusIcon, EditIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardIcon } from '../components/Icons';
import { Expense, PaymentStatus, RecurringPayable } from '../../types';
import { parseLocalDate, formatDocument } from '../utils';


type ActiveTab = 'all' | 'recorrente';
type StatusFilter = 'all' | PaymentStatus | 'Atrasado' | 'Condicional';

const MonthNavigator: React.FC<{
    selectedDate: Date;
    onDateChange: (newDate: Date) => void;
}> = ({ selectedDate, onDateChange }) => {
    const changeMonth = (offset: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset, 1);
        onDateChange(newDate);
    };
    const goToToday = () => onDateChange(new Date());

    return (
        <div className="bg-secondary/70 dark:bg-secondary/70 backdrop-blur-md p-3 rounded-xl shadow-lg dark:shadow-cyan-900/10 border border-border flex items-center justify-between">
            <Button variant="secondary" onClick={() => changeMonth(-1)} className="!p-2.5"><ChevronLeftIcon className="w-5 h-5" /></Button>
            <div className="text-center">
                 <h2 className="text-lg font-bold text-text-primary capitalize">{selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                <Button variant="secondary" onClick={goToToday} className="!p-0 !text-accent !text-xs !bg-transparent !border-none h-auto">Ir para Hoje</Button>
            </div>
            <Button variant="secondary" onClick={() => changeMonth(1)} className="!p-2.5"><ChevronRightIcon className="w-5 h-5" /></Button>
        </div>
    );
};


export const Payables: React.FC<{ showToast: (msg: string, type?: 'success' | 'error') => void }> = ({ showToast }) => {
    const { expenses, recurringPayables, handleAddExpense, handleUpdateExpense, handleDeleteExpense, handleAddRecurringPayable, handleUpdateRecurringPayable, handleDeleteRecurringPayable, handlePayRecurringExpense } = useData();
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Expense | RecurringPayable | null>(null);
    
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<ActiveTab>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    
    const [formType, setFormType] = useState<'single' | 'recurring'>('single');
    const [dueDateType, setDueDateType] = useState<'fixed' | 'delivery'>('fixed');

    const initialExpenseState: Omit<Expense, 'id' | 'recurringPayableId'> = { description: '', value: 0, dueDate: new Date().toISOString().split('T')[0], status: PaymentStatus.Pendente, supplier: '', document: '', pixKey: '', paymentDate: '', isConditionalDueDate: false, dueDateCondition: '' };
    const [singleExpenseState, setSingleExpenseState] = useState(initialExpenseState);
    
    const initialRecurringState: Omit<RecurringPayable, 'id' | 'paidInstallments'> = { description: '', value: 0, recurringInstallments: 12, recurringCycleStart: new Date().toISOString().split('T')[0], supplier: '', document: '', pixKey: ''};
    const [recurringPayableState, setRecurringPayableState] = useState(initialRecurringState);
    
    useEffect(() => {
        if (isModalOpen) {
            if (editingItem) {
                if ('recurringInstallments' in editingItem) { // It's a RecurringPayable
                    setFormType('recurring');
                    setRecurringPayableState(editingItem);
                } else { // It's an Expense
                    setFormType('single');
                    setSingleExpenseState(editingItem);
                    if (editingItem.isConditionalDueDate) {
                        setDueDateType('delivery');
                    } else {
                        setDueDateType('fixed');
                    }
                }
            } else {
                setFormType('single');
                const today = new Date().toISOString().split('T')[0];
                setSingleExpenseState({...initialExpenseState, dueDate: today});
                setRecurringPayableState(initialRecurringState);
                setDueDateType('fixed');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, editingItem]);

    const displayedRecords = useMemo(() => {
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();

        if (activeTab === 'recorrente') {
             return recurringPayables.map(payable => {
                const startDate = parseLocalDate(payable.recurringCycleStart);
                const startYear = startDate.getFullYear();
                const startMonth = startDate.getMonth();
                const monthOffset = (selectedYear - startYear) * 12 + (selectedMonth - startMonth);
                const installmentNumber = monthOffset + 1;

                if (monthOffset < 0 || installmentNumber > payable.recurringInstallments) return null;

                const existingPaidExpense = expenses.find(e => e.recurringPayableId === payable.id && e.description.includes(`Parcela ${installmentNumber}/`));
                if (existingPaidExpense) return existingPaidExpense;

                const dueDate = new Date(startYear, startMonth + monthOffset, startDate.getDate());
                return {
                    id: `virtual-${payable.id}-${installmentNumber}`,
                    description: `${payable.description} - Parcela ${installmentNumber}/${payable.recurringInstallments}`,
                    value: payable.value,
                    dueDate: dueDate.toISOString().split('T')[0],
                    status: PaymentStatus.Pendente,
                    supplier: payable.supplier, document: payable.document, pixKey: payable.pixKey,
                    isVirtual: true,
                    masterId: payable.id, // to find the original payable
                    isConditionalDueDate: false,
                    dueDateCondition: '',
                };
            }).filter(Boolean);
        }

        let records = expenses.filter(e => !e.recurringPayableId);
        if (statusFilter !== 'all') {
             if (statusFilter === 'Condicional') {
                return records.filter(rec => rec.isConditionalDueDate && rec.status === PaymentStatus.Pendente);
            }
            records = records.filter(rec => getFinancialStatus(rec) === statusFilter);
        }
        return records.sort((a,b) => (a.dueDate && b.dueDate) ? parseLocalDate(a.dueDate).getTime() - parseLocalDate(b.dueDate).getTime() : 0);

    }, [expenses, recurringPayables, selectedDate, activeTab, statusFilter]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formType === 'recurring') {
            if (editingItem && 'recurringInstallments' in editingItem) {
                handleUpdateRecurringPayable(recurringPayableState as RecurringPayable);
                showToast("Conta recorrente atualizada!");
            } else {
                handleAddRecurringPayable({...recurringPayableState, paidInstallments: 0});
                showToast("Conta recorrente adicionada!");
            }
        } else {
            if (editingItem && !('recurringInstallments' in editingItem)) {
                handleUpdateExpense(singleExpenseState as Expense);
                showToast("Conta atualizada!");
            } else {
                handleAddExpense(singleExpenseState);
                showToast("Conta adicionada!");
            }
        }
        setModalOpen(false);
    };
    
    const openModal = (item: Expense | RecurringPayable | null = null) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    const openDeleteConfirm = (item: Expense | RecurringPayable) => {
        setEditingItem(item);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (editingItem) {
            if ('recurringInstallments' in editingItem) {
                handleDeleteRecurringPayable(editingItem.id);
            } else {
                handleDeleteExpense(editingItem.id);
            }
            showToast("Registro excluído!");
        }
        setDeleteConfirmOpen(false);
        setEditingItem(null);
    };
    
    const handlePayVirtual = (masterId: string, installmentNumber: number, dueDate: string) => {
        const masterPayable = recurringPayables.find(p => p.id === masterId);
        if (masterPayable) {
            handlePayRecurringExpense(masterPayable, installmentNumber, dueDate);
            showToast("Pagamento recorrente registrado!");
        }
    };
    
     const handleCopy = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            showToast('Chave Pix copiada!', 'success');
        }, () => {
            showToast('Falha ao copiar Chave Pix.', 'error');
        });
    };

    return (
        <div className="p-4 space-y-6">
            <MonthNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
            <div className="border-b border-border flex">
                <button onClick={() => setActiveTab('all')} className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'all' ? 'border-accent text-accent' : 'border-transparent text-text-secondary'}`}>Todas</button>
                <button onClick={() => setActiveTab('recorrente')} className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${activeTab === 'recorrente' ? 'border-accent text-accent' : 'border-transparent text-text-secondary'}`}>Recorrentes</button>
            </div>
            {activeTab === 'all' && (
                <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                    {(['all', PaymentStatus.Pendente, 'Atrasado', 'Condicional', PaymentStatus.Pago] as const).map(status => (
                        <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${statusFilter === status ? 'bg-accent text-white' : 'bg-secondary/70 text-text-secondary hover:bg-secondary'}`}>{status === 'all' ? 'Todos' : status}</button>
                    ))}
                </div>
            )}
            <div className="space-y-4">
                {displayedRecords.length > 0 ? displayedRecords.map(rec => {
                    if (!rec) return null;
                    const isVirtual = 'isVirtual' in rec && rec.isVirtual;
                    return (
                        <Card key={rec.id}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-text-primary">R$ {rec.value.toFixed(2).replace('.', ',')}</h4>
                                    <p className="text-sm text-text-secondary">{rec.description}</p>
                                    {rec.supplier && <p className="text-xs text-text-secondary">Fornecedor: {rec.supplier} {rec.document && `(${rec.document})`}</p>}
                                    {rec.pixKey && (
                                        <div className="text-xs text-text-secondary flex items-center mt-1">
                                            <span>Pix: {rec.pixKey}</span>
                                            <button onClick={() => handleCopy(rec.pixKey!)} className="ml-2 p-1 hover:bg-primary rounded-full text-text-secondary hover:text-accent" aria-label="Copiar chave pix">
                                                <ClipboardIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-text-secondary mb-1">Venc.: {rec.isConditionalDueDate ? rec.dueDateCondition : (rec.dueDate ? parseLocalDate(rec.dueDate).toLocaleDateString() : 'N/A')}</p>
                                    <FinancialStatusBadge record={rec} />
                                </div>
                            </div>
                             {(rec.pixKey || !isVirtual) && (
                                <div className="flex justify-end items-center space-x-2 mt-2 border-t border-border pt-2">
                                    {isVirtual ? (
                                        <Button onClick={() => handlePayVirtual((rec as any).masterId!, parseInt(rec.id.split('-').pop()!), rec.dueDate!)} variant="secondary" className="!py-1.5 !px-4 !text-xs">Marcar como Pago</Button>
                                    ) : (
                                        <>
                                             <button onClick={() => openModal(rec as Expense)} className="p-1.5 hover:bg-primary rounded-full"><EditIcon className="w-4 h-4" /></button>
                                             <button onClick={() => openDeleteConfirm(rec as Expense)} className="p-1.5 hover:bg-primary rounded-full text-status-reproved"><TrashIcon className="w-4 h-4" /></button>
                                        </>
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                }) : <EmptyState message="Nenhum registro para este período/filtro." icon={<ArrowUpCircleIcon className="w-12 h-12" />} action={<Button onClick={() => openModal()}>Adicionar Conta</Button>}/>}
            </div>
            <FloatingActionButton onClick={() => openModal()} icon={<PlusIcon />} />
             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Editar Conta a Pagar" : "Adicionar Conta a Pagar"}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                     <div className="grid grid-cols-2 gap-2 p-1 bg-primary rounded-lg">
                        <Button type="button" variant={formType === 'single' ? 'primary' : 'secondary'} onClick={() => setFormType('single')} className="!py-2">Conta Única</Button>
                        <Button type="button" variant={formType === 'recurring' ? 'primary' : 'secondary'} onClick={() => setFormType('recurring')} className="!py-2">Conta Recorrente</Button>
                    </div>

                    {formType === 'single' ? (
                        <div className="space-y-4 animate-fade-in">
                            <FormField label="Descrição"><Input value={singleExpenseState.description} onChange={e => setSingleExpenseState(p => ({...p, description: e.target.value}))} required /></FormField>
                            <FormField label="Fornecedor (Opcional)"><Input value={singleExpenseState.supplier} onChange={e => setSingleExpenseState(p => ({...p, supplier: e.target.value}))} /></FormField>
                            <FormField label="CPF ou CNPJ"><Input value={singleExpenseState.document || ''} onChange={e => setSingleExpenseState(p => ({...p, document: formatDocument(e.target.value)}))} /></FormField>
                            <FormField label="Chave Pix">
                                <div className="relative">
                                    <Input value={singleExpenseState.pixKey} onChange={e => setSingleExpenseState(p => ({...p, pixKey: e.target.value}))} className="pr-10" />
                                    <button type="button" onClick={() => handleCopy(singleExpenseState.pixKey || '')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-accent" aria-label="Copiar Chave Pix">
                                        <ClipboardIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </FormField>
                            <FormField label="Valor (R$)"><Input type="number" step="0.01" value={singleExpenseState.value} onChange={e => setSingleExpenseState(p => ({...p, value: parseFloat(e.target.value)}))} required /></FormField>
                            
                            <FormField label="Opção de Vencimento">
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <Button
                                        type="button"
                                        variant={dueDateType === 'fixed' ? 'primary' : 'secondary'}
                                        onClick={() => {
                                            setDueDateType('fixed');
                                            setSingleExpenseState(p => ({
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
                                            setSingleExpenseState(p => ({
                                                ...p,
                                                isConditionalDueDate: true,
                                                dueDateCondition: p.dueDateCondition || 'A combinar',
                                                dueDate: '',
                                            }));
                                        }}
                                        className="!py-2"
                                    >
                                        Na Entrega
                                    </Button>
                                </div>
                            </FormField>

                            {dueDateType === 'fixed' ? (
                                <div className="animate-fade-in">
                                    <FormField label="Data de Vencimento">
                                        <Input
                                            type="date"
                                            value={singleExpenseState.dueDate}
                                            onChange={e => setSingleExpenseState(p => ({ ...p, dueDate: e.target.value }))}
                                            required
                                        />
                                    </FormField>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <FormField label="Condição de Vencimento">
                                        <Input
                                            type="text"
                                            value={singleExpenseState.dueDateCondition}
                                            onChange={e => setSingleExpenseState(p => ({ ...p, dueDateCondition: e.target.value }))}
                                            placeholder="Ex: Após aprovação da campanha"
                                            required
                                        />
                                    </FormField>
                                </div>
                            )}

                            <FormField label="Status">
                                <Select value={singleExpenseState.status} onChange={e => setSingleExpenseState(p => ({...p, status: e.target.value as PaymentStatus}))}>
                                    <option value={PaymentStatus.Pendente}>Pendente</option>
                                    <option value={PaymentStatus.Pago}>Pago</option>
                                </Select>
                            </FormField>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <FormField label="Descrição da Recorrência"><Input value={recurringPayableState.description} onChange={e => setRecurringPayableState(p => ({...p, description: e.target.value}))} required /></FormField>
                            <FormField label="Fornecedor (Opcional)"><Input value={recurringPayableState.supplier} onChange={e => setRecurringPayableState(p => ({...p, supplier: e.target.value}))} /></FormField>
                            <FormField label="CPF ou CNPJ"><Input value={recurringPayableState.document || ''} onChange={e => setRecurringPayableState(p => ({...p, document: formatDocument(e.target.value)}))} /></FormField>
                             <FormField label="Chave Pix">
                                <div className="relative">
                                    <Input value={recurringPayableState.pixKey} onChange={e => setRecurringPayableState(p => ({...p, pixKey: e.target.value}))} className="pr-10"/>
                                     <button type="button" onClick={() => handleCopy(recurringPayableState.pixKey || '')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-accent" aria-label="Copiar Chave Pix">
                                        <ClipboardIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </FormField>
                            <FormField label="Valor Mensal (R$)"><Input type="number" step="0.01" value={recurringPayableState.value} onChange={e => setRecurringPayableState(p => ({...p, value: parseFloat(e.target.value)}))} required /></FormField>
                            <div className="grid grid-cols-2 gap-4">
                               <FormField label="Total de Parcelas"><Input type="number" value={recurringPayableState.recurringInstallments} onChange={e => setRecurringPayableState(p => ({...p, recurringInstallments: parseInt(e.target.value,10)}))} required /></FormField>
                               <FormField label="Início da Cobrança"><Input type="date" value={recurringPayableState.recurringCycleStart} onChange={e => setRecurringPayableState(p => ({ ...p, recurringCycleStart: e.target.value }))} required /></FormField>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end pt-4"><Button type="submit">{editingItem ? 'Salvar Alterações' : 'Adicionar'}</Button></div>
                </form>
            </Modal>
             <ConfirmationModal 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir "${editingItem?.description}"? ${editingItem && 'recurringInstallments' in editingItem ? 'Todas as contas pagas desta recorrência também serão excluídas.' : ''}`}
            />
        </div>
    );
};