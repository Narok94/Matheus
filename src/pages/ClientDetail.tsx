import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Card, Modal, getStatusBadge, Button, Input, FormField, ConfirmationModal, ToggleSwitch, Select, Textarea } from '../components/common';
import { AgendaIcon, DownloadIcon, EditIcon, TrashIcon, PlusIcon } from '../components/Icons';
import { capitalizeWords, formatDocument, formatPhone, setWorksheetColumns, parseLocalDate } from '../utils';
import { Client, ClientEquipment, InspectionStatus } from '../../types';

export const ClientDetail: React.FC<{ 
    clientId: string; 
    onScheduleInspection: (clientId: string) => void; 
    onViewInspection: (inspectionId: string) => void;
}> = ({ clientId, onScheduleInspection, onViewInspection }) => {
    const { 
        clients, equipment, clientEquipment, inspections, handleUpdateClient, handleDeleteClient, 
        handleAddClientEquipment, handleUpdateClientEquipment, handleDeleteClientEquipment 
    } = useData();

    const client = clients.find(c => c.id === clientId);

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editedClient, setEditedClient] = useState<Client | undefined>(client);
    
    const [isAssetModalOpen, setAssetModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<ClientEquipment | null>(null);
    const [assetToDelete, setAssetToDelete] = useState<ClientEquipment | null>(null);

    const initialAssetState: Omit<ClientEquipment, 'id' | 'clientId'> = { equipmentId: '', serialNumber: '', location: '', status: InspectionStatus.Agendada };
    const [assetFormState, setAssetFormState] = useState(initialAssetState);

    useEffect(() => {
        setEditedClient(clients.find(c => c.id === clientId));
    }, [clientId, clients]);
    
    useEffect(() => {
        if (isAssetModalOpen) {
            if (editingAsset) {
                setAssetFormState(editingAsset);
            } else {
                setAssetFormState(initialAssetState);
            }
        }
    }, [isAssetModalOpen, editingAsset]);

    if (!client || !editedClient) {
        return <div className="p-4 text-text-secondary">Cliente não encontrado ou carregando...</div>;
    }

    const clientAssets = clientEquipment.filter(e => e.clientId === client.id);
    const clientInspections = inspections.filter(i => i.clientId === client.id);

    // Client Edit Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let formattedValue: string | number = value;
        if (name === 'document') formattedValue = formatDocument(value);
        if (name === 'contact') formattedValue = formatPhone(value);
        if (['name', 'address', 'city', 'contactName'].includes(name)) formattedValue = capitalizeWords(value);
        if (['recurringAmount', 'recurringInstallments', 'paidInstallments'].includes(name)) formattedValue = parseInt(value, 10) || 0;

        setEditedClient(prev => prev ? ({ ...prev, [name]: formattedValue }) : prev);
    };

     const handleRecurringToggle = (enabled: boolean) => {
        setEditedClient(prev => prev ? ({
            ...prev,
            isRecurring: enabled,
            recurringAmount: enabled ? (prev.recurringAmount || 0) : 0,
            recurringInstallments: enabled ? (prev.recurringInstallments || 0) : 0,
        }) : prev);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editedClient) {
            handleUpdateClient(editedClient);
        }
        setEditModalOpen(false);
    };
    
    // Asset Handlers
    const handleAssetFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAssetFormState(prev => ({...prev, [name]: value}));
    };
    
    const handleAssetFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAsset) {
            handleUpdateClientEquipment(assetFormState as ClientEquipment);
        } else {
            handleAddClientEquipment({ ...assetFormState, clientId: client.id });
        }
        setAssetModalOpen(false);
        setEditingAsset(null);
    };
    
    const openDeleteAssetModal = (asset: ClientEquipment) => {
        setAssetToDelete(asset);
    };
    
    const confirmDeleteAsset = () => {
        if (assetToDelete) {
            handleDeleteClientEquipment(assetToDelete.id);
            setAssetToDelete(null);
        }
    };
    
    const handleExportReport = () => {
        const XLSX = (window as any).XLSX;
    
        const titleStyle = { font: { bold: true, sz: 16, color: { rgb: "FF0EA5E9" } } };
        const labelStyle = { font: { bold: true } };
    
        const clientDataSheetData = [
            [{ v: `Relatório Detalhado: ${client.name}`, s: titleStyle }], [],
            [{ v: "Nome", s: labelStyle }, client.name], [{ v: "Documento", s: labelStyle }, client.document],
            [{ v: "Endereço", s: labelStyle }, client.address], [{ v: "Cidade", s: labelStyle }, client.city],
            [{ v: "Contato", s: labelStyle }, `${client.contactName} - ${client.contact}`], [{ v: "Email", s: labelStyle }, client.email], [],
            [{ v: "Gerado em:", s: labelStyle }, new Date().toLocaleString()],
        ];
        const clientWorksheet = XLSX.utils.aoa_to_sheet(clientDataSheetData);
        clientWorksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
        clientWorksheet['!cols'] = [{ wch: 15 }, { wch: 40 }];
    
        let equipmentWorksheet;
        if (clientAssets.length > 0) {
            const equipmentDataForSheet = clientAssets.map(asset => {
                const product = equipment.find(p => p.id === asset.equipmentId);
                return { "Nome": product?.name, "Nº Série": asset.serialNumber, "Localização": asset.location, "Status": asset.status, "Vencimento": asset.expiryDate ? parseLocalDate(asset.expiryDate).toLocaleDateString() : 'N/A', "Últ. Inspeção": asset.lastInspectionDate ? parseLocalDate(asset.lastInspectionDate).toLocaleDateString() : 'N/A' }
            });
            equipmentWorksheet = XLSX.utils.json_to_sheet(equipmentDataForSheet);
            setWorksheetColumns(equipmentWorksheet, equipmentDataForSheet);
        } else {
            equipmentWorksheet = XLSX.utils.aoa_to_sheet([["Nenhum equipamento cadastrado para este cliente."]]);
        }
    
        let inspectionWorksheet;
        if (clientInspections.length > 0) {
            const inspectionDataForSheet = clientInspections.map(insp => ({ "Data": parseLocalDate(insp.date).toLocaleDateString(), "Inspetor": insp.inspector, "Status": insp.status, "Observações": insp.observations, "Nº Itens": insp.inspectedItems.length }));
            inspectionWorksheet = XLSX.utils.json_to_sheet(inspectionDataForSheet);
            setWorksheetColumns(inspectionWorksheet, inspectionDataForSheet);
        } else {
            inspectionWorksheet = XLSX.utils.aoa_to_sheet([["Nenhum histórico de inspeção/vistoria."]]);
        }
    
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, clientWorksheet, "Dados do Cliente");
        XLSX.utils.book_append_sheet(workbook, equipmentWorksheet, "Equipamentos");
        XLSX.utils.book_append_sheet(workbook, inspectionWorksheet, "Inspeções e Vistorias");
    
        XLSX.writeFile(workbook, `Relatorio_${client.name.replace(/\s+/g, '_')}.xlsx`);
    };

    return (
        <div className="p-4 space-y-6">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">{client.name}</h2>
                        <p className="text-text-secondary">{client.document}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => setEditModalOpen(true)} className="p-2 text-text-secondary hover:text-accent"><EditIcon /></button>
                        <button onClick={() => setDeleteModalOpen(true)} className="p-2 text-text-secondary hover:text-status-reproved"><TrashIcon /></button>
                    </div>
                </div>
                 <div className="mt-4 text-sm text-text-secondary space-y-1">
                    <p>{client.address}, {client.city}</p>
                    <p>{client.contactName} &middot; {client.contact} &middot; {client.email}</p>
                </div>
            </div>

            {client.licenseValidityNotes && (
                <Card title="Validade das Licenças" collapsible>
                    <p className="text-text-secondary text-sm whitespace-pre-wrap">
                        {client.licenseValidityNotes}
                    </p>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={() => onScheduleInspection(client.id)} className="w-full justify-center">
                    <AgendaIcon className="w-5 h-5" />
                    <span>Agendar Inspeção/Vistoria</span>
                </Button>
                 <Button onClick={handleExportReport} variant="secondary" className="w-full justify-center">
                    <DownloadIcon className="w-5 h-5" />
                    <span>Exportar Relatório</span>
                </Button>
            </div>

            {client.isRecurring && (
                <Card title="Plano de Pagamento Recorrente" collapsible>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Valor Mensal:</span>
                            <span className="font-semibold text-text-primary">R$ {client.recurringAmount?.toFixed(2).replace('.',',')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Progresso:</span>
                            <span className="font-semibold text-text-primary">{client.paidInstallments || 0} / {client.recurringInstallments} parcelas pagas</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Início do Ciclo:</span>
                            <span className="font-semibold text-text-primary">{client.recurringCycleStart ? parseLocalDate(client.recurringCycleStart).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </Card>
            )}

            <Card title={`Equipamentos do Cliente (${clientAssets.length})`} collapsible actions={<Button variant="secondary" className="!py-1 !px-3 !text-xs" onClick={() => setAssetModalOpen(true)}><PlusIcon className="w-4 h-4 mr-1" /> Adicionar</Button>}>
                {clientAssets.length > 0 ? clientAssets.map(asset => {
                    const product = equipment.find(p => p.id === asset.equipmentId);
                    return (
                    <div key={asset.id} className="py-2 border-b border-border last:border-b-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-text-primary">{product?.name} <span className="text-text-secondary text-xs">({asset.serialNumber})</span></p>
                                <p className="text-sm text-text-secondary">Vencimento: {asset.expiryDate ? parseLocalDate(asset.expiryDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            {getStatusBadge(asset.status)}
                        </div>
                        <div className="flex justify-end space-x-2 mt-1">
                            <button onClick={() => { setEditingAsset(asset); setAssetModalOpen(true); }} className="p-1.5 hover:bg-primary rounded-full"><EditIcon className="w-4 h-4" /></button>
                            <button onClick={() => openDeleteAssetModal(asset)} className="p-1.5 hover:bg-primary rounded-full text-status-reproved"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}) : <p className="text-text-secondary text-sm">Nenhum equipamento cadastrado.</p>}
            </Card>

            <Card title={`Histórico de Inspeções/Vistorias (${clientInspections.length})`} collapsible>
                {clientInspections.length > 0 ? clientInspections.map(insp => (
                    <div key={insp.id} onClick={() => onViewInspection(insp.id)} className="flex justify-between items-center py-2 border-b border-border last:border-b-0 cursor-pointer hover:bg-primary/50 -mx-4 px-4 rounded-md">
                        <div>
                            <p className="font-semibold text-text-primary">Data: {parseLocalDate(insp.date).toLocaleDateString()}</p>
                            <p className="text-sm text-text-secondary">Inspetor: {insp.inspector}</p>
                        </div>
                        {getStatusBadge(insp.status)}
                    </div>
                )) : <p className="text-text-secondary text-sm">Nenhuma inspeção/vistoria realizada.</p>}
            </Card>
            
             <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Cliente">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <FormField label="Nome Completo / Razão Social"><Input name="name" value={editedClient.name} onChange={handleInputChange} required /></FormField>
                    <FormField label="CPF / CNPJ"><Input name="document" value={editedClient.document} onChange={handleInputChange} required /></FormField>
                    <FormField label="Endereço"><Input name="address" value={editedClient.address} onChange={handleInputChange} /></FormField>
                    <FormField label="Cidade"><Input name="city" value={editedClient.city} onChange={handleInputChange} required /></FormField>
                    <FormField label="Nome do Contato"><Input name="contactName" value={editedClient.contactName} onChange={handleInputChange} required /></FormField>
                    <FormField label="Telefone de Contato"><Input name="contact" type="tel" value={editedClient.contact} onChange={handleInputChange} required /></FormField>
                    <FormField label="Email"><Input name="email" type="email" value={editedClient.email} onChange={handleInputChange} /></FormField>
                    <FormField label="Validade das Licenças (Notas)">
                        <Textarea name="licenseValidityNotes" value={editedClient.licenseValidityNotes || ''} onChange={handleInputChange} placeholder="Ex: Alvará de Funcionamento vence em 10/12/2025..." />
                    </FormField>
                    
                    <div className="pt-4 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-primary/50 rounded-lg">
                            <label className="text-sm font-medium text-text-secondary">Pagamento Recorrente?</label>
                            <ToggleSwitch enabled={editedClient.isRecurring || false} onChange={handleRecurringToggle} />
                        </div>

                        {editedClient.isRecurring && (
                            <div className="p-4 border border-border rounded-lg space-y-4 animate-fade-in">
                                <FormField label="Valor Mensal (R$)"><Input type="number" step="0.01" name="recurringAmount" value={editedClient.recurringAmount || ''} onChange={handleInputChange} required /></FormField>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Total de Parcelas"><Input type="number" name="recurringInstallments" value={editedClient.recurringInstallments || ''} onChange={handleInputChange} required /></FormField>
                                    <FormField label="Parcelas Pagas"><Input type="number" name="paidInstallments" value={editedClient.paidInstallments || 0} onChange={handleInputChange} required /></FormField>
                                </div>
                                <FormField label="Início da Cobrança"><Input type="date" name="recurringCycleStart" value={editedClient.recurringCycleStart || ''} onChange={handleInputChange} required /></FormField>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end pt-4"><Button type="submit">Salvar Alterações</Button></div>
                </form>
            </Modal>
            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => handleDeleteClient(client.id)}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir ${client.name}? Todos os equipamentos e inspeções associados também serão removidos. Esta ação não pode ser desfeita.`}
            />
            
            {/* Asset Modals */}
             <Modal isOpen={isAssetModalOpen} onClose={() => setAssetModalOpen(false)} title={editingAsset ? "Editar Equipamento do Cliente" : "Adicionar Equipamento ao Cliente"}>
                <form onSubmit={handleAssetFormSubmit} className="space-y-4">
                    <FormField label="Tipo de Equipamento (do Catálogo)">
                        <Select name="equipmentId" value={assetFormState.equipmentId} onChange={handleAssetFormChange} required>
                            <option value="">Selecione um produto</option>
                            {equipment.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                    </FormField>
                    <FormField label="Número de Série"><Input name="serialNumber" value={assetFormState.serialNumber} onChange={handleAssetFormChange} required /></FormField>
                    <FormField label="Localização"><Input name="location" value={assetFormState.location} onChange={handleAssetFormChange} required /></FormField>
                    <FormField label="Status">
                        <Select name="status" value={assetFormState.status} onChange={handleAssetFormChange} required>
                            {Object.values(InspectionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </FormField>
                    <div className="flex justify-end pt-4"><Button type="submit">{editingAsset ? "Salvar Alterações" : "Adicionar Equipamento"}</Button></div>
                </form>
            </Modal>
            <ConfirmationModal 
                isOpen={!!assetToDelete}
                onClose={() => setAssetToDelete(null)}
                onConfirm={confirmDeleteAsset}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir o equipamento "${equipment.find(p => p.id === assetToDelete?.equipmentId)?.name}"? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
};