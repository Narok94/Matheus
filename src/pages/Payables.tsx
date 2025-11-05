import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Card, EmptyState, FloatingActionButton, Modal, FormField, Input, Select, Button, ConfirmationModalWithSeriesDelete, FinancialStatusBadge, ToggleSwitch } from '../components/common';
import { ArrowUpCircleIcon, PlusIcon, EditIcon, TrashIcon } from '../components/Icons';
import { Expense, PaymentStatus } from '../../types';
import { parseLocalDate } from '../utils';

type RecurrenceFormState = {
    isRecurring: boolean;
    frequency: 'monthly' | 'quarterly' | 'annually';
    durationType: 'installments' | 'date' | 'indefinite';
    installments: number;
    endDate: string;
}

export const Payables: React.FC = () => {
    const { expenses, handleAddExpense, handleAddExpenses, handleUpdateExpense, handleDeleteExpense, handleDeleteExpenseSeries } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const initialFormState: Omit<Expense, 'id'> = { description: '', value: 0, dueDate: new Date().toISOString().split('T')[0], status: PaymentStatus.Pendente, supplier: '', paymentDate: '' };
    const [formState, setFormState] = useState<Omit<Expense, 'id'>>(initialFormState);
    const [recurrenceState, setRecurrenceState] = useState<RecurrenceFormState>({ isRecurring: false, frequency: 'monthly', durationType: 'installments', installments: 12, endDate: ''});

    useEffect(() => {
        if (isModalOpen) {
            setRecurrenceState({ isRecurring: false, frequency: 'monthly', durationType: 'installments', installments: 12, endDate: ''});
            if (editingExpense) {
                setFormState({
                    ...editingExpense,
                    supplier: editingExpense.supplier || '',
                    paymentDate: editingExpense.paymentDate || '',
                });
            } else {
                setFormState(initialFormState);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, editingExpense]);

    const openAddModal = () => {
        setEditingExpense(null);
        setModalOpen(true);
    };

    const openEditModal = (exp: Expense) => {
        setEditingExpense(exp);
        setModalOpen(true);
    };

    const openDeleteConfirm = (exp: Expense) => {
        setExpenseToDelete(exp);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (recurrenceState.isRecurring && !editingExpense) {
            const expensesToCreate: Omit<Expense, 'id'>[] = [];
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
                
                expensesToCreate.push({
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
            handleAddExpenses(expensesToCreate);
        } else if (editingExpense) {
            handleUpdateExpense({ ...formState, id: editingExpense.id });
        } else {
            handleAddExpense(formState);
        }
        setModalOpen(false);
    };
    
    const confirmDeleteSingle = () => {
        if (expenseToDelete) {
            handleDeleteExpense(expenseToDelete.id);
        }
        setExpenseToDelete(null);
    };

    const confirmDeleteSeries = () => {
        if (expenseToDelete?.recurringGroupId && expenseToDelete?.recurringInstance) {
            handleDeleteExpenseSeries(expenseToDelete.recurringGroupId, expenseToDelete.recurringInstance);
        }
        setExpenseToDelete(null);
    };

    return (
        <div className="p-4 space-y-6">
            <div className="space-y-4">
                {expenses.length > 0 ? expenses.map(rec => (
                    <Card key={rec.id}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-text-primary">R$ {rec.value.toFixed(2).replace('.', ',')}</h4>
                                <p className="text-sm text-text-secondary">{rec.description}</p>
                                {rec.supplier && <p className="text-xs text-text-secondary">Fornecedor: {rec.supplier}</p>}
                                <p className="text-xs text-text-secondary mt-1">Vencimento: {parseLocalDate(rec.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <FinancialStatusBadge record={rec} />
                                <div className="flex space-x-2 mt-2">
                                    <button onClick={() => openEditModal(rec)} className="p-1.5 hover:bg-primary rounded-full"><EditIcon className="w-4 h-4" /></button>
                                    <button onClick={() => openDeleteConfirm(rec)} className="p-1.5 hover:bg-primary rounded-full text-status-reproved"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    </Card>
                )) : <EmptyState message="Nenhum registro de contas a pagar." icon={<ArrowUpCircleIcon className="w-12 h-12" />} action={<Button onClick={openAddModal}>Adicionar Conta</Button>}/>}
            </div>
             <FloatingActionButton onClick={openAddModal} icon={<PlusIcon />} />
             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingExpense ? "Editar Conta a Pagar" : "Adicionar Conta a Pagar"}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Descrição"><Input value={formState.description} onChange={e => setFormState(p => ({...p, description: e.target.value}))} required /></FormField>
                    <FormField label="Fornecedor (Opcional)"><Input value={formState.supplier} onChange={e => setFormState(p => ({...p, supplier: e.target.value}))} /></FormField>
                    <FormField label="Valor (R$)"><Input type="number" step="0.01" value={formState.value} onChange={e => setFormState(p => ({...p, value: parseFloat(e.target.value)}))} required /></FormField>
                    <FormField label="Data de Vencimento"><Input type="date" value={formState.dueDate} onChange={e => setFormState(p => ({...p, dueDate: e.target.value}))} required /></FormField>

                    {!editingExpense && (
                         <div className="pt-2 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-primary/50 rounded-lg">
                                <label className="text-sm font-medium text-text-secondary">É uma despesa recorrente?</label>
                                <ToggleSwitch enabled={recurrenceState.isRecurring} onChange={enabled => setRecurrenceState(p => ({...p, isRecurring: enabled}))} />
                            </div>
                            {recurrenceState.isRecurring && (
                                <div className="p-4 border border-border rounded-lg space-y-4 animate-fade-in">
                                    <p className="text-xs text-text-secondary">A data de vencimento acima será usada como data de início para a primeira parcela.</p>
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
                                    {recurrenceState.durationType === 'indefinite' && <p className="text-xs text-text-secondary p-2 bg-primary/50 rounded-md">Serão geradas despesas para os próximos 5 anos.</p>}
                                </div>
                            )}
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
                            <FormField label="Data de Pagamento"><Input type="date" value={formState.paymentDate} onChange={e => setFormState(p => ({...p, paymentDate: e.target.value}))} /></FormField>
                         </div>
                    )}
                    <div className="flex justify-end pt-4"><Button type="submit">{editingExpense ? 'Salvar Alterações' : 'Adicionar'}</Button></div>
                </form>
            </Modal>
             <ConfirmationModalWithSeriesDelete 
                isOpen={!!expenseToDelete}
                onClose={() => setExpenseToDelete(null)}
                onConfirmSingle={confirmDeleteSingle}
                onConfirmSeries={confirmDeleteSeries}
                title="Confirmar Exclusão"
                message={
                    expenseToDelete?.recurringGroupId ? (
                        <p>Esta despesa faz parte de uma série recorrente. Você deseja excluir apenas esta instância ou esta e todas as futuras despesas <strong className="text-status-reproved">pendentes</strong>?</p>
                    ) : (
                        `Tem certeza que deseja excluir a conta "${expenseToDelete?.description}"?`
                    )
                }
            />
        </div>
    );
};