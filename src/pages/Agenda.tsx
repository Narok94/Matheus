import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { InspectionStatus, PrefilledInspectionData } from '../../types';
import { Card, Modal, getStatusBadge, Button, Input, Select, Textarea, FormField, EmptyState, FloatingActionButton } from '../components/common';
import { AgendaIcon, PlusIcon } from '../components/Icons';

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


export const Agenda: React.FC<{ 
    prefilledData: PrefilledInspectionData, 
    onPrefillHandled: () => void, 
    showToast: (msg: string, type?: 'success' | 'error') => void,
    onViewInspection: (inspectionId: string) => void 
}> = ({ prefilledData, onPrefillHandled, showToast, onViewInspection }) => {
    const { inspections, clients, equipment, handleAddInspection } = useData();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [filter, setFilter] = useState<InspectionStatus | 'all'>('all');
    
    const initialInspectionState = { clientId: '', equipmentIds: [] as string[], date: '', inspector: 'João Silva', observations: '', status: InspectionStatus.Agendada };
    const [newInspection, setNewInspection] = useState(initialInspectionState);
    
    const clientEquipment = useMemo(() => {
        return equipment.filter(e => e.clientId === newInspection.clientId);
    }, [equipment, newInspection.clientId]);

    useEffect(() => {
        if(prefilledData?.clientId) {
            setNewInspection(prev => ({
                ...prev,
                clientId: prefilledData.clientId || '',
                date: new Date().toISOString().split('T')[0],
            }));
            setAddModalOpen(true);
            onPrefillHandled();
        }
    }, [prefilledData, onPrefillHandled]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newInspection.equipmentIds.length === 0) {
            showToast("Selecione ao menos um equipamento para a inspeção.", "error");
            return;
        }
        handleAddInspection(newInspection);
        setNewInspection(initialInspectionState);
        setAddModalOpen(false);
        showToast("Inspeção agendada com sucesso!");
    };
    
    const handleEquipmentSelection = (equipmentId: string, isSelected: boolean) => {
        setNewInspection(prev => {
            const currentIds = prev.equipmentIds;
            if (isSelected) {
                return { ...prev, equipmentIds: [...currentIds, equipmentId] };
            } else {
                return { ...prev, equipmentIds: currentIds.filter(id => id !== equipmentId) };
            }
        });
    };

    const sortedAndFilteredInspections = useMemo(() => {
        const filtered = filter === 'all' 
            ? inspections 
            : inspections.filter(i => i.status === filter);
        return [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [inspections, filter]);

    return (
        <div className="p-4 space-y-4">
            <StatusFilter selectedStatus={filter} onStatusChange={setFilter} />
            {sortedAndFilteredInspections.length > 0 ? sortedAndFilteredInspections.map(insp => {
                const client = clients.find(c => c.id === insp.clientId);
                return (
                    <Card key={insp.id} className="p-0" onClick={() => onViewInspection(insp.id)}>
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-text-primary">{client?.name}</h4>
                                    <p className="text-sm text-text-secondary">{new Date(insp.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                {getStatusBadge(insp.status)}
                            </div>
                            <p className="text-xs text-text-secondary mt-2">Inspetor: {insp.inspector}</p>
                        </div>
                    </Card>
                )
            }) : <EmptyState message="Nenhuma inspeção encontrada para este filtro." icon={<AgendaIcon className="w-12 h-12" />} action={<Button onClick={() => setAddModalOpen(true)}>Agendar Inspeção</Button>} />}
             <FloatingActionButton onClick={() => setAddModalOpen(true)} icon={<PlusIcon />} />
             <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Agendar Nova Inspeção">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Cliente">
                        <Select name="clientId" value={newInspection.clientId} onChange={(e) => setNewInspection(p => ({...p, clientId: e.target.value, equipmentIds: []}))} required>
                            <option value="">Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </FormField>

                    {newInspection.clientId && (
                        <FormField label="Equipamentos a Inspecionar">
                            <div className="max-h-40 overflow-y-auto bg-primary/50 p-2 rounded-lg border border-border space-y-2 mt-1">
                                {clientEquipment.length > 0 ? clientEquipment.map(eq => (
                                    <label key={eq.id} className="flex items-center space-x-3 p-2 hover:bg-secondary rounded-md cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                                            checked={newInspection.equipmentIds.includes(eq.id)}
                                            onChange={(e) => handleEquipmentSelection(eq.id, e.target.checked)}
                                        />
                                        <span className="text-sm text-text-primary">{eq.name} ({eq.serialNumber})</span>
                                    </label>
                                )) : <p className="text-xs text-text-secondary text-center p-2">Nenhum equipamento para este cliente.</p>}
                            </div>
                        </FormField>
                    )}
                    
                    <FormField label="Data da Inspeção"><Input type="date" name="date" value={newInspection.date} onChange={(e) => setNewInspection(p => ({...p, date: e.target.value}))} required /></FormField>
                    <FormField label="Observações"><Textarea name="observations" value={newInspection.observations} onChange={(e) => setNewInspection(p => ({...p, observations: e.target.value}))} /></FormField>
                    <div className="flex justify-end pt-4"><Button type="submit">Agendar</Button></div>
                </form>
            </Modal>
        </div>
    );
};