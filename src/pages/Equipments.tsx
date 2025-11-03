import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Equipment, InspectionStatus } from '../../types';
import { Card, Modal, getStatusBadge, Button, Input, Select, FormField, EmptyState, FloatingActionButton, ConfirmationModal, Textarea } from '../components/common';
import { EquipmentIcon, PlusIcon, EditIcon, TrashIcon } from '../components/Icons';

export const Equipments: React.FC<{showToast: (msg: string, type?: 'success' | 'error') => void}> = ({ showToast }) => {
    const { equipment, clients, handleAddEquipment, handleUpdateEquipment, handleDeleteEquipment } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    
    const initialFormState: Omit<Equipment, 'id'> = { clientId: '', name: '', serialNumber: '', expiryDate: '', category: 'Extintor', unitOfMeasure: 'Unidade', capacity: '', manufacturer: '', status: InspectionStatus.Agendada, lastInspectionDate: '', costPrice: 0, salePrice: 0, observations: '' };
    const [formState, setFormState] = useState<Omit<Equipment, 'id'>>(initialFormState);

    useEffect(() => {
        if (isModalOpen && editingEquipment) {
            setFormState({
                ...editingEquipment,
                costPrice: editingEquipment.costPrice || 0,
                salePrice: editingEquipment.salePrice || 0,
                observations: editingEquipment.observations || '',
            });
        } else {
            setFormState(initialFormState);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, editingEquipment]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['costPrice', 'salePrice'].includes(name);
        setFormState(p => ({ ...p, [name]: isNumeric ? parseFloat(value) : value }));
    };

    const filteredEquipment = useMemo(() => {
        return equipment.filter(eq => {
            const client = clients.find(c => c.id === eq.clientId);
            return eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   client?.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [searchTerm, equipment, clients]);

    const openAddModal = () => {
        setEditingEquipment(null);
        setModalOpen(true);
    };

    const openEditModal = (eq: Equipment) => {
        setEditingEquipment(eq);
        setModalOpen(true);
    };

    const openDeleteConfirm = (eq: Equipment) => {
        setEditingEquipment(eq);
        setDeleteConfirmOpen(true);
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEquipment) {
            handleUpdateEquipment({ ...formState, id: editingEquipment.id });
            showToast('Equipamento atualizado com sucesso!');
        } else {
            handleAddEquipment(formState);
            showToast('Equipamento adicionado com sucesso!');
        }
        setModalOpen(false);
    };
    
    const confirmDelete = () => {
        if (editingEquipment) {
            handleDeleteEquipment(editingEquipment.id);
            showToast('Equipamento excluído com sucesso!');
        }
        setDeleteConfirmOpen(false);
        setEditingEquipment(null);
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
                                    <div className="flex-shrink-0 ml-4">{getStatusBadge(eq.status)}</div>
                                </div>
                                <div className="text-xs text-text-secondary mt-2 flex justify-between items-end">
                                    <div>
                                        <p>Cliente: <span className="font-semibold text-text-primary">{client?.name}</span></p>
                                        <p>Vencimento: {new Date(eq.expiryDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => openEditModal(eq)} className="p-2 hover:bg-primary rounded-full"><EditIcon /></button>
                                        <button onClick={() => openDeleteConfirm(eq)} className="p-2 hover:bg-primary rounded-full text-status-reproved"><TrashIcon /></button>
                                    </div>
                                </div>
                             </div>
                        </Card>
                    );
                }) : <EmptyState message="Nenhum equipamento encontrado." icon={<EquipmentIcon className="w-12 h-12" />} action={<Button onClick={openAddModal}>Adicionar Equipamento</Button>} />}
            </div>
             <FloatingActionButton onClick={openAddModal} icon={<PlusIcon />} />
              <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingEquipment ? 'Editar Equipamento' : 'Adicionar Equipamento'}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Cliente">
                        <Select name="clientId" value={formState.clientId} onChange={handleInputChange} required>
                            <option value="">Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </FormField>
                    <FormField label="Nome do Equipamento"><Input name="name" value={formState.name} onChange={handleInputChange} required /></FormField>
                    <FormField label="Número de Série"><Input name="serialNumber" value={formState.serialNumber} onChange={handleInputChange} required /></FormField>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Categoria">
                            <Select name="category" value={formState.category} onChange={handleInputChange}>
                                <option>Extintor</option>
                                <option>Hidrante</option>
                                <option>Sinalização</option>
                                <option>Alarme</option>
                                <option>Outro</option>
                            </Select>
                        </FormField>
                        <FormField label="Unidade de Medida">
                            <Select name="unitOfMeasure" value={formState.unitOfMeasure} onChange={handleInputChange}>
                                <option>Unidade</option>
                                <option>Metro</option>
                                <option>Litro</option>
                                <option>Kit</option>
                            </Select>
                        </FormField>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Preço de Custo (R$)"><Input type="number" step="0.01" name="costPrice" value={formState.costPrice} onChange={handleInputChange} /></FormField>
                        <FormField label="Preço de Venda (R$)"><Input type="number" step="0.01" name="salePrice" value={formState.salePrice} onChange={handleInputChange} /></FormField>
                    </div>
                    <FormField label="Data de Vencimento"><Input type="date" name="expiryDate" value={formState.expiryDate} onChange={handleInputChange} required /></FormField>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Capacidade"><Input name="capacity" value={formState.capacity} onChange={handleInputChange} /></FormField>
                        <FormField label="Fabricante"><Input name="manufacturer" value={formState.manufacturer} onChange={handleInputChange} /></FormField>
                    </div>
                    <FormField label="Observações"><Textarea name="observations" value={formState.observations} onChange={handleInputChange} /></FormField>

                    <div className="flex justify-end pt-4"><Button type="submit">{editingEquipment ? 'Salvar Alterações' : 'Adicionar'}</Button></div>
                </form>
            </Modal>
            <ConfirmationModal 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir o equipamento "${editingEquipment?.name}"? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
};