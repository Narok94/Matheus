import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { InspectionStatus, PrefilledInspectionData, InspectedItem, InspectionItemStatus, ClientEquipment } from '../../types';
import { Card, Modal, getStatusBadge, Button, Input, Select, Textarea, FormField, EmptyState, FloatingActionButton } from '../components/common';
import { AgendaIcon, PlusIcon } from '../components/Icons';
import { Calendar } from '../components/Calendar';

const StatusFilter: React.FC<{
    selectedStatus: InspectionStatus | 'all';
    onStatusChange: (status: InspectionStatus | 'all') => void;
}> = ({ selectedStatus, onStatusChange }) => {
    const statuses: (InspectionStatus | 'all')[] = ['all', ...Object.values(InspectionStatus)];
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
                    {status === 'all' ? 'Todas' : status}
                </button>
            ))}
        </div>
    );
};

const InspectedItemForm: React.FC<{
    item: InspectedItem;
    clientEquipment: ClientEquipment;
    productName: string;
    onUpdate: (field: keyof InspectedItem, value: string) => void;
}> = ({ item, clientEquipment, productName, onUpdate }) => {
    return (
        <div className="p-3 bg-secondary rounded-lg border border-border space-y-3">
            <p className="font-semibold text-text-primary">{productName} <span className="text-xs text-text-secondary">({clientEquipment.serialNumber})</span></p>
            <FormField label="Localização">
                <Input value={item.location} onChange={e => onUpdate('location', e.target.value)} placeholder="Ex: Térreo, Corredor B" required />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <FormField label="Situação">
                    <Select value={item.situation} onChange={e => onUpdate('situation', e.target.value as InspectionItemStatus)}>
                        <option value={InspectionItemStatus.Conforme}>Conforme</option>
                        <option value={InspectionItemStatus.NaoConforme}>Não Conforme</option>
                    </Select>
                </FormField>
                 <FormField label="Ação Sugerida">
                    <Input value={item.suggestedAction} onChange={e => onUpdate('suggestedAction', e.target.value)} placeholder="Ex: Reparo, Troca" required />
                </FormField>
            </div>
        </div>
    )
}


export const Agenda: React.FC<{ 
    prefilledData: PrefilledInspectionData, 
    onPrefillHandled: () => void, 
    showToast: (msg: string, type?: 'success' | 'error') => void,
    onViewInspection: (inspectionId: string) => void 
}> = ({ prefilledData, onPrefillHandled, showToast, onViewInspection }) => {
    const { inspections, clients, equipment, clientEquipment, handleAddInspection } = useData();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [filter, setFilter] = useState<InspectionStatus | 'all'>('all');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    
    const initialInspectionState = { clientId: '', inspectedItems: [] as InspectedItem[], date: '', inspector: 'João Silva', observations: '', status: InspectionStatus.Agendada };
    const [newInspection, setNewInspection] = useState(initialInspectionState);
    
    const selectedClientEquipment = useMemo(() => {
        return clientEquipment.filter(e => e.clientId === newInspection.clientId);
    }, [clientEquipment, newInspection.clientId]);

    const inspectionDates = useMemo(() => 
        inspections.map(i => i.date), 
    [inspections]);

    useEffect(() => {
        if(prefilledData?.clientId) {
            const inspectionDate = new Date(); // Using today's date for prefill
            setNewInspection(prev => ({
                ...prev,
                clientId: prefilledData.clientId || '',
                date: inspectionDate.toISOString().split('T')[0],
            }));
            setSelectedDate(inspectionDate);
            setAddModalOpen(true);
            onPrefillHandled();
        }
    }, [prefilledData, onPrefillHandled]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newInspection.inspectedItems.length === 0) {
            showToast("Selecione e detalhe ao menos um equipamento para a inspeção.", "error");
            return;
        }
        handleAddInspection(newInspection);
        setNewInspection(initialInspectionState);
        setAddModalOpen(false);
        showToast("Inspeção agendada com sucesso!");
    };
    
    const handleEquipmentSelection = (clientEquipmentId: string, isSelected: boolean) => {
        setNewInspection(prev => {
            const currentItems = prev.inspectedItems;
            if (isSelected) {
                const asset = selectedClientEquipment.find(ce => ce.id === clientEquipmentId);
                const newItem: InspectedItem = { clientEquipmentId, location: asset?.location || '', situation: InspectionItemStatus.Conforme, suggestedAction: 'Nenhuma' };
                return { ...prev, inspectedItems: [...currentItems, newItem] };
            } else {
                return { ...prev, inspectedItems: currentItems.filter(item => item.clientEquipmentId !== clientEquipmentId) };
            }
        });
    };
    
    const handleInspectedItemUpdate = (clientEquipmentId: string, field: keyof InspectedItem, value: string) => {
        setNewInspection(prev => ({
            ...prev,
            inspectedItems: prev.inspectedItems.map(item => item.clientEquipmentId === clientEquipmentId ? { ...item, [field]: value } : item)
        }));
    };

    const sortedAndFilteredInspections = useMemo(() => {
        let items = inspections;

        if (selectedDate) {
            const selectedISO = selectedDate.toISOString().split('T')[0];
            items = items.filter(i => i.date === selectedISO);
        }
        
        if (filter !== 'all') {
            items = items.filter(i => i.status === filter);
        }

        return [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [inspections, filter, selectedDate]);
    
    const handleOpenAddModal = () => {
        const dateForNewInspection = selectedDate || new Date();
        setNewInspection({
            ...initialInspectionState,
            date: dateForNewInspection.toISOString().split('T')[0]
        });
        setAddModalOpen(true);
    };

    const statusColors: Record<InspectionStatus, string> = {
        [InspectionStatus.Aprovado]: 'bg-status-approved',
        [InspectionStatus.Reprovado]: 'bg-status-reproved',
        [InspectionStatus.Pendente]: 'bg-status-pending',
        [InspectionStatus.Agendada]: 'bg-status-scheduled',
    };

    return (
        <div className="p-4 space-y-4">
            <Card className="animate-fade-in">
                <Calendar 
                    selectedDate={selectedDate} 
                    onDateSelect={setSelectedDate} 
                    highlightedDates={inspectionDates} 
                />
            </Card>
            
            <div className="flex justify-between items-center pt-4">
                <h2 className="text-xl font-bold text-text-primary">
                    {selectedDate ? `Inspeções do Dia` : 'Todas as Inspeções'}
                </h2>
                {selectedDate && (
                    <Button variant="secondary" className="!py-1 !px-3 !text-xs" onClick={() => setSelectedDate(null)}>
                        Ver todas
                    </Button>
                )}
            </div>

            <StatusFilter selectedStatus={filter} onStatusChange={setFilter} />
            
            <div className="space-y-3">
                {sortedAndFilteredInspections.length > 0 ? sortedAndFilteredInspections.map(insp => {
                    const client = clients.find(c => c.id === insp.clientId);
                    return (
                        <div key={insp.id} onClick={() => onViewInspection(insp.id)} className="bg-secondary/70 dark:bg-secondary/70 backdrop-blur-md rounded-lg flex items-stretch cursor-pointer hover:border-accent border border-transparent transition-all duration-300 hover:-translate-y-px active:scale-[0.99] shadow-lg dark:shadow-cyan-900/10">
                            <div className={`w-2 flex-shrink-0 rounded-l-lg ${statusColors[insp.status]}`}></div>
                            <div className="p-3 flex-grow flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-text-primary pr-2">{client?.name || 'Cliente não encontrado'}</h4>
                                    <div className="flex-shrink-0">
                                        {getStatusBadge(insp.status)}
                                    </div>
                                </div>
                                <div className="text-xs text-text-secondary mt-2 flex justify-between items-end">
                                    <span>Inspetor: {insp.inspector}</span>
                                    <span>{insp.inspectedItems.length} item(ns)</span>
                                </div>
                            </div>
                        </div>
                    )
                }) : <EmptyState message={selectedDate ? "Nenhuma inspeção agendada para este dia." : "Nenhuma inspeção encontrada para este filtro."} icon={<AgendaIcon className="w-12 h-12" />} action={<Button onClick={handleOpenAddModal}>Agendar Inspeção</Button>} />}
            </div>

             <FloatingActionButton onClick={handleOpenAddModal} icon={<PlusIcon />} />
             <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Agendar Nova Inspeção">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Cliente">
                        <Select name="clientId" value={newInspection.clientId} onChange={(e) => setNewInspection(p => ({...p, clientId: e.target.value, inspectedItems: []}))} required>
                            <option value="">Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </FormField>

                    {newInspection.clientId && (
                        <>
                        <FormField label="Selecionar Equipamentos do Cliente">
                            <div className="max-h-60 overflow-y-auto bg-primary/50 p-2 rounded-lg border border-border space-y-2 mt-1">
                                {selectedClientEquipment.length > 0 ? selectedClientEquipment.map(asset => {
                                    const product = equipment.find(p => p.id === asset.equipmentId);
                                    return (
                                        <label key={asset.id} className="flex items-center space-x-3 p-2 hover:bg-secondary rounded-md cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                                                checked={newInspection.inspectedItems.some(item => item.clientEquipmentId === asset.id)}
                                                onChange={(e) => handleEquipmentSelection(asset.id, e.target.checked)}
                                            />
                                            <span className="text-sm text-text-primary">{product?.name} ({asset.serialNumber})</span>
                                        </label>
                                    )
                                }) : <p className="text-xs text-text-secondary text-center p-2">Nenhum equipamento cadastrado para este cliente.</p>}
                            </div>
                        </FormField>
                         {newInspection.inspectedItems.length > 0 && (
                            <FormField label="Detalhes dos Itens a Inspecionar">
                                <div className="space-y-3 mt-1">
                                    {newInspection.inspectedItems.map(item => {
                                        const asset = selectedClientEquipment.find(eq => eq.id === item.clientEquipmentId);
                                        const product = asset ? equipment.find(p => p.id === asset.equipmentId) : null;
                                        if (!asset || !product) return null;
                                        return <InspectedItemForm key={item.clientEquipmentId} item={item} clientEquipment={asset} productName={product.name} onUpdate={(field, value) => handleInspectedItemUpdate(item.clientEquipmentId, field, value)} />
                                    })}
                                </div>
                            </FormField>
                        )}
                        </>
                    )}
                    
                    <FormField label="Data da Inspeção"><Input type="date" name="date" value={newInspection.date} onChange={(e) => setNewInspection(p => ({...p, date: e.target.value}))} required /></FormField>
                    <FormField label="Observações Gerais"><Textarea name="observations" value={newInspection.observations} onChange={(e) => setNewInspection(p => ({...p, observations: e.target.value}))} /></FormField>
                    <div className="flex justify-end pt-4">
                        <Button 
                            type="submit" 
                            disabled={!newInspection.clientId || newInspection.inspectedItems.length === 0}
                        >
                            Agendar
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};