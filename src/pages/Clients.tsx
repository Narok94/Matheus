import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Modal, Button, Input, FormField, EmptyState, FloatingActionButton, ToggleSwitch, Textarea } from '../components/common';
import { ClientsIcon, PlusIcon } from '../components/Icons';
import { capitalizeWords, formatDocument, formatPhone } from '../utils';
import { Client } from '../../types';

interface ClientsProps {
    onViewClient: (clientId: string) => void;
}

type RecurrenceFilter = 'all' | 'recurring' | 'non-recurring';

export const Clients: React.FC<ClientsProps> = ({ onViewClient }) => {
    const { clients, handleAddClient } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [recurrenceFilter, setRecurrenceFilter] = useState<RecurrenceFilter>('all');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialClientState: Omit<Client, 'id'> = { 
        name: '', document: '', address: '', city: '', contactName: '', contact: '', email: '',
        isRecurring: false, recurringAmount: 0, recurringInstallments: 0, recurringCycleStart: new Date().toISOString().split('T')[0], paidInstallments: 0,
        licenseValidityNotes: ''
    };
    const [newClient, setNewClient] = useState(initialClientState);

    const filteredClients = useMemo(() =>
        clients
            .filter(client => {
                if (recurrenceFilter === 'recurring') return client.isRecurring;
                if (recurrenceFilter === 'non-recurring') return !client.isRecurring;
                return true; // 'all'
            })
            .filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.document.includes(searchTerm) ||
                client.city.toLowerCase().includes(searchTerm.toLowerCase())
            ), [searchTerm, clients, recurrenceFilter]);

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let formattedValue: string | number = value;

        switch (name) {
            case 'name':
            case 'address':
            case 'city':
            case 'contactName':
                formattedValue = capitalizeWords(value);
                break;
            case 'document':
                formattedValue = formatDocument(value);
                break;
            case 'contact':
                formattedValue = formatPhone(value);
                break;
            case 'recurringAmount':
            case 'recurringInstallments':
                formattedValue = parseInt(value, 10) || 0;
                break;
        }
        setNewClient(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleRecurringToggle = (enabled: boolean) => {
        setNewClient(prev => ({
            ...prev,
            isRecurring: enabled,
            recurringAmount: enabled ? (prev.recurringAmount || 0) : 0,
            recurringInstallments: enabled ? (prev.recurringInstallments || 0) : 0,
            paidInstallments: 0,
        }));
    };
    
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            handleAddClient(newClient);
            setNewClient(initialClientState);
            setAddModalOpen(false);
            setIsSubmitting(false);
        }, 300);
    };

    return (
        <div className="p-4 space-y-4">
            <Input type="text" placeholder="🔍 Buscar por nome, CNPJ ou cidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            
            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                {(['all', 'recurring', 'non-recurring'] as const).map(filter => (
                    <button
                        key={filter}
                        onClick={() => setRecurrenceFilter(filter)}
                        className={`px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
                            recurrenceFilter === filter
                            ? 'bg-accent text-white'
                            : 'bg-secondary/70 text-text-secondary hover:bg-secondary'
                        }`}
                    >
                        {filter === 'all' ? 'Todos' : filter === 'recurring' ? 'Recorrentes' : 'Não Recorrentes'}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {filteredClients.length > 0 ? filteredClients.map(client => (
                    <div key={client.id} className="bg-secondary/70 dark:bg-secondary/70 backdrop-blur-md p-4 rounded-xl shadow-lg dark:shadow-cyan-900/10 border border-border cursor-pointer hover:border-accent transition-all duration-300 hover:-translate-y-px active:scale-[0.99]" onClick={() => onViewClient(client.id)}>
                         <div className="flex items-center">
                            <div className="bg-accent/10 text-accent rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                                {client.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-text-primary">{client.name}</h4>
                                <p className="text-sm text-text-secondary">{client.city}</p>
                            </div>
                        </div>
                    </div>
                )) : <EmptyState message="Nenhum cliente encontrado." icon={<ClientsIcon className="w-12 h-12" />} action={<Button onClick={() => setAddModalOpen(true)}>Adicionar Cliente</Button>} /> }
            </div>
            <FloatingActionButton onClick={() => setAddModalOpen(true)} icon={<PlusIcon />} />
            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar Novo Cliente">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Nome Completo / Razão Social"><Input name="name" value={newClient.name} onChange={handleInputChange} required /></FormField>
                    <FormField label="CPF / CNPJ"><Input name="document" value={newClient.document} onChange={handleInputChange} required /></FormField>
                    <FormField label="Endereço"><Input name="address" value={newClient.address} onChange={handleInputChange} /></FormField>
                    <FormField label="Cidade"><Input name="city" value={newClient.city} onChange={handleInputChange} required /></FormField>
                    <FormField label="Nome do Contato"><Input name="contactName" value={newClient.contactName} onChange={handleInputChange} required /></FormField>
                    <FormField label="Telefone de Contato"><Input name="contact" type="tel" value={newClient.contact} onChange={handleInputChange} required /></FormField>
                    <FormField label="Email"><Input name="email" type="email" value={newClient.email} onChange={handleInputChange} /></FormField>
                    <FormField label="Validade das Licenças (Notas)">
                        <Textarea name="licenseValidityNotes" value={newClient.licenseValidityNotes || ''} onChange={handleInputChange} placeholder="Ex: Alvará de Funcionamento vence em 10/12/2025..." />
                    </FormField>
                    
                    <div className="pt-4 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-primary/50 rounded-lg">
                            <label className="text-sm font-medium text-text-secondary">Pagamento Recorrente?</label>
                            <ToggleSwitch enabled={newClient.isRecurring || false} onChange={handleRecurringToggle} />
                        </div>

                        {newClient.isRecurring && (
                            <div className="p-4 border border-border rounded-lg space-y-4 animate-fade-in">
                                <FormField label="Valor Mensal (R$)"><Input type="number" step="0.01" name="recurringAmount" value={newClient.recurringAmount} onChange={handleInputChange} required /></FormField>
                                <FormField label="Total de Parcelas"><Input type="number" name="recurringInstallments" value={newClient.recurringInstallments} onChange={handleInputChange} required /></FormField>
                                <FormField label="Início da Cobrança"><Input type="date" name="recurringCycleStart" value={newClient.recurringCycleStart} onChange={handleInputChange} required /></FormField>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end pt-4"><Button type="submit" loading={isSubmitting}>Salvar Cliente</Button></div>
                </form>
            </Modal>
        </div>
    );
};