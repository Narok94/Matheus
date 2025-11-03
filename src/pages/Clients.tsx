import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Modal, Button, Input, FormField, EmptyState, FloatingActionButton } from '../components/common';
import { ClientsIcon, PlusIcon } from '../components/Icons';
import { capitalizeWords, formatDocument, formatPhone } from '../utils';

interface ClientsProps {
    onViewClient: (clientId: string) => void;
}

export const Clients: React.FC<ClientsProps> = ({ onViewClient }) => {
    const { clients, handleAddClient } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', document: '', address: '', city: '', contact: '', email: '' });

    const filteredClients = useMemo(() =>
        clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.document.includes(searchTerm) ||
            client.city.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm, clients]);

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        switch (name) {
            case 'name':
            case 'address':
            case 'city':
                formattedValue = capitalizeWords(value);
                break;
            case 'document':
                formattedValue = formatDocument(value);
                break;
            case 'contact':
                formattedValue = formatPhone(value);
                break;
        }

        setNewClient(prev => ({ ...prev, [name]: formattedValue }));
    };
    
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleAddClient(newClient);
        setNewClient({ name: '', document: '', address: '', city: '', contact: '', email: '' });
        setAddModalOpen(false);
    };

    return (
        <div className="p-4 space-y-4">
            <Input type="text" placeholder="🔍 Buscar por nome, CNPJ ou cidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            
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
                    <FormField label="Contato (Telefone)"><Input name="contact" type="tel" value={newClient.contact} onChange={handleInputChange} required /></FormField>
                    <FormField label="Email"><Input name="email" type="email" value={newClient.email} onChange={handleInputChange} /></FormField>
                    <div className="flex justify-end pt-4"><Button type="submit">Salvar Cliente</Button></div>
                </form>
            </Modal>
        </div>
    );
};
