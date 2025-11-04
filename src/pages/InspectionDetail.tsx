import React from 'react';
import { useData } from '../context/DataContext';
import { InspectionStatus } from '../../types';
import { Card, getStatusBadge, Button, Select, FormField } from '../components/common';
import { CertificateIcon, EquipmentIcon } from '../components/Icons';
import { parseLocalDate } from '../utils';

export const InspectionDetail: React.FC<{
    inspectionId: string;
    showToast: (msg: string, type?: 'success' | 'error') => void;
}> = ({ inspectionId, showToast }) => {
    const { inspections, clients, equipment, clientEquipment, handleUpdateInspection, handleAddCertificate, certificates } = useData();

    const inspection = inspections.find(i => i.id === inspectionId);

    if (!inspection) {
        return <div className="p-4 text-center text-text-secondary">Inspeção não encontrada.</div>;
    }

    const client = clients.find(c => c.id === inspection.clientId);
    const hasCertificate = certificates.some(c => c.inspectionId === inspection.id);

    const handleStatusChange = (newStatus: InspectionStatus) => {
        handleUpdateInspection({ ...inspection, status: newStatus });
        showToast(`Status da inspeção atualizado para "${newStatus}".`);
    };

    const generateCertificate = () => {
        if (!hasCertificate) {
            handleAddCertificate(inspection);
            showToast("Certificado gerado com sucesso!");
        } else {
            showToast("Este certificado já foi gerado.", "error");
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div>
                <p className="text-sm text-text-secondary">{parseLocalDate(inspection.date).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</p>
                <h1 className="text-2xl font-bold text-text-primary">{client?.name}</h1>
                <div className="mt-2">
                    {getStatusBadge(inspection.status)}
                </div>
            </div>

            <Card title="Ações Rápidas">
                <div className="space-y-4">
                    <FormField label="Alterar Status da Inspeção">
                        <Select 
                            value={inspection.status} 
                            onChange={(e) => handleStatusChange(e.target.value as InspectionStatus)}
                        >
                            {Object.values(InspectionStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </Select>
                    </FormField>

                    {inspection.status === InspectionStatus.Aprovado && (
                        <Button onClick={generateCertificate} disabled={hasCertificate} className="w-full justify-center">
                            <CertificateIcon className="w-5 h-5 mr-2" />
                            {hasCertificate ? 'Certificado Já Gerado' : 'Gerar Certificado'}
                        </Button>
                    )}
                </div>
            </Card>

            <Card title={`Equipamentos Inspecionados (${inspection.inspectedItems.length})`} actions={<EquipmentIcon />}>
                {inspection.inspectedItems.length > 0 ? (
                     <ul className="space-y-3">
                        {inspection.inspectedItems.map(item => {
                            const asset = clientEquipment.find(e => e.id === item.clientEquipmentId);
                            if (!asset) return null;
                            const product = equipment.find(p => p.id === asset.equipmentId);
                             return (
                                 <li key={item.clientEquipmentId} className="text-sm p-3 bg-primary rounded-lg border border-border">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-text-primary">{product?.name}</p>
                                            <p className="text-text-secondary text-xs">S/N: {asset.serialNumber}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${item.situation === 'Conforme' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.situation}</span>
                                    </div>
                                    <div className="mt-2 text-xs text-text-secondary border-t border-border pt-2">
                                        <p><span className="font-medium">Local:</span> {item.location}</p>
                                        <p><span className="font-medium">Ação Sugerida:</span> {item.suggestedAction}</p>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <p className="text-text-secondary text-sm">Nenhum equipamento vinculado a esta inspeção.</p>
                )}
            </Card>

            <Card title="Observações do Inspetor">
                <p className="text-text-secondary text-sm">
                    {inspection.observations || "Nenhuma observação registrada."}
                </p>
            </Card>
        </div>
    );
};