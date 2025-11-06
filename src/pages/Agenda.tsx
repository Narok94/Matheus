import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { InspectionStatus, AgendaAction, InspectedItem } from '../../types';
import { Card, Modal, getStatusBadge, Button, Input, Select, Textarea, FormField, EmptyState, FloatingActionButton } from '../components/common';
import { AgendaIcon, PlusIcon } from '../components/Icons';
import { Calendar } from '../components/Calendar';
import { formatLocalDate } from '../utils';

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

const initialInspectionState = { clientId: '', inspectedItems: [] as InspectedItem[], date: '', time: '', address: '', inspector: 'Admin', observations: '', status: InspectionStatus.Agendada };

export const Agenda: React.FC<{ 
    action: AgendaAction, 
    onActionHandled: () => void, 
    showToast: (msg: string, type?: 'success' | 'error') => void,
    onViewInspection: (inspectionId: string) => void 
}> = ({ action, onActionHandled, showToast, onViewInspection }) => {
    const { inspections, clients, handleAddInspection } = useData();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [filter, setFilter] = useState<InspectionStatus | 'all'>('all');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    
    const [newInspection, setNewInspection] = useState(initialInspectionState);
    
    const inspectionDates = useMemo(() => 
        inspections.map(i => i.date), 
    [inspections]);

    useEffect(() => {
        if (action?.action === 'openModal') {
            const inspectionDate = new Date();
            const selectedClient = action.clientId ? clients.find(c => c.id === action.clientId) : null;
            
            setNewInspection({
                ...initialInspectionState,
                clientId: action.clientId || '',
                date: formatLocalDate(inspectionDate),
                address: selectedClient?.address || '',
            });

            setSelectedDate(inspectionDate);
            setAddModalOpen(true);
            onActionHandled();
        }
    }, [action, onActionHandled, clients]);
    
    // Auto-fill address when client is selected
    useEffect(() => {
        if (newInspection.clientId) {
            const client = clients.find(c => c.id === newInspection.clientId);
            if (client) {
                setNewInspection(prev => ({ ...prev, address: client.address }));
            }
        } else {
            setNewInspection(prev => ({ ...prev, address: '' }));
        }
    }, [newInspection.clientId, clients]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewInspection(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddInspection(newInspection);
        setNewInspection(initialInspectionState);
        setAddModalOpen(false);
        showToast("Inspeção/Vistoria agendada com sucesso!");
    };

    const sortedAndFilteredInspections = useMemo(() => {
        let items = inspections;

        if (selectedDate) {
            const selectedISO = formatLocalDate(selectedDate);
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
            date: formatLocalDate(dateForNewInspection)
        });
        setAddModalOpen(true);
    };

    const statusColors: Record<InspectionStatus, string> = {
        [InspectionStatus.Aprovado]: 'bg-status-approved',
        [InspectionStatus.Reprovado]: 'bg-status-reproved',
        [InspectionStatus.Pendente]: 'bg-status-pending',
        [InspectionStatus.Agendada]: 'bg-status-scheduled',
        [InspectionStatus.Concluída]: 'bg-status-completed',
        [InspectionStatus.Cancelada]: 'bg-status-cancelled',
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
                    {selectedDate ? `Inspeções/Vistorias do Dia` : 'Todas as Inspeções/Vistorias'}
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
                }) : <EmptyState message={selectedDate ? "Nenhuma inspeção/vistoria agendada para este dia." : "Nenhuma inspeção/vistoria encontrada para este filtro."} icon={<AgendaIcon className="w-12 h-12" />} action={<Button onClick={handleOpenAddModal}>Agendar Inspeção/Vistoria</Button>} />}
            </div>

             <FloatingActionButton onClick={handleOpenAddModal} icon={<PlusIcon />} />
             <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Agendar Nova Inspeção/Vistoria">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Empresa">
                        <Select name="clientId" value={newInspection.clientId} onChange={handleInputChange} required>
                            <option value="">Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </FormField>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Data">
                            <Input type="date" name="date" value={newInspection.date} onChange={handleInputChange} required />
                        </FormField>
                        <FormField label="Horário">
                             <Input type="time" name="time" value={newInspection.time} onChange={handleInputChange} />
                        </FormField>
                    </div>

                    <FormField label="Endereço da Vistoria">
                        <Input name="address" value={newInspection.address || ''} onChange={handleInputChange} required />
                    </FormField>

                    <FormField label="Observação (O que será vistoriado?)">
                        <Textarea 
                            name="observations" 
                            value={newInspection.observations} 
                            onChange={handleInputChange}
                            placeholder="Ex: 5 extintores PQS, 2 hidrantes de parede, etc."
                        />
                    </FormField>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={!newInspection.clientId}>
                            Agendar
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};