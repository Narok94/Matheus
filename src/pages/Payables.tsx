import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { Card, EmptyState, FloatingActionButton, Modal, FormField, Input, Select, Button, ConfirmationModal, FinancialStatusBadge } from '../components/common';
import { ArrowUpCircleIcon, PlusIcon, EditIcon, TrashIcon } from '../components/Icons';
import { Expense, PaymentStatus } from '../../types';
import { parseLocalDate } from '../utils';

export const Payables: React.FC = () => {
    const { expenses, handleAddExpense, handleUpdateExpense, handleDeleteExpense } = useData();
    const { appSettings } = useSettings();
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const initialFormState: Omit<Expense, 'id'> = { description: '', value: 0, dueDate: '', status: PaymentStatus.Pendente, supplier: '', paymentDate: '' };
    const [formState, setFormState] = useState<Omit<Expense, 'id'>>(initialFormState);

    useEffect(() => {
        if (isModalOpen && editingExpense) {
            setFormState({
                ...editingExpense,
                supplier: editingExpense.supplier || '',
                paymentDate: editingExpense.paymentDate || '',
            });
        } else {
            setFormState(initialFormState);
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
        setEditingExpense(exp);
        setDeleteConfirmOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingExpense) {
            handleUpdateExpense({ ...formState, id: editingExpense.id });
        } else {
            handleAddExpense(formState);
        }
        setModalOpen(false);
    };
    
    const confirmDelete = () => {
        if (editingExpense) {
            handleDeleteExpense(editingExpense.id);
        }
        setDeleteConfirmOpen(false);
        setEditingExpense(null);
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
                                    <button onClick={() => openDeleteConfirm(rec)} className="p-1.5 hover:bg-primary rounded-full text-status-reproved disabled:opacity-50 disabled:cursor-not-allowed" disabled={appSettings.dataProtectionEnabled}><TrashIcon className="w-4 h-4" /></button>
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
                    <FormField label="Status">
                        <Select value={formState.status} onChange={e => setFormState(p => ({...p, status: e.target.value as PaymentStatus}))}>
                            <option value={PaymentStatus.Pendente}>Pendente</option>
                            <option value={PaymentStatus.Pago}>Pago</option>
                        </Select>
                    </FormField>
                    {formState.status === PaymentStatus.Pago && (
                        <FormField label="Data de Pagamento"><Input type="date" value={formState.paymentDate} onChange={e => setFormState(p => ({...p, paymentDate: e.target.value}))} /></FormField>
                    )}
                    <div className="flex justify-end pt-4"><Button type="submit">{editingExpense ? 'Salvar Alterações' : 'Adicionar'}</Button></div>
                </form>
            </Modal>
             <ConfirmationModal 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir a conta "${editingExpense?.description}"?`}
            />
        </div>
    );
};