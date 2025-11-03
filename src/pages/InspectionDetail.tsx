import React from 'react';
import { useData } from '../context/DataContext';
import { InspectionStatus } from '../../types';
import { Card, getStatusBadge, Button, Select, FormField } from '../components/common';
import { CertificateIcon, EquipmentIcon } from '../components/Icons';

export const InspectionDetail: React.FC<{
    inspectionId: string;
    showToast: (msg: string, type?: 'success' | 'error') => void;
}> = ({ inspectionId, showToast }) => {
    const { inspections, clients, equipment, handleUpdateInspection, handleAddCertificate, certificates } = useData();

    const inspection = inspections.find(i => i.id === inspectionId);

    if (!inspection) {
        return <div className="p-4 text-center text-text-secondary">Inspeção não encontrada.</div>;
    }

    const client = clients.find(c => c.id === inspection.clientId);
    const inspectedEquipment = equipment.filter(e => inspection.equipmentIds.includes(e.id));
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
                <p className="text-sm text-text-secondary">{new Date(inspection.date).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</p>
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

            <Card title={`Equipamentos Inspecionados (${inspectedEquipment.length})`} actions={<EquipmentIcon />}>
                {inspectedEquipment.length > 0 ? (
                     <ul className="space-y-2">
                        {inspectedEquipment.map(eq => (
                             <li key={eq.id} className="text-sm p-3 bg-primary rounded-md">
                                <p className="font-semibold text-text-primary">{eq.name}</p>
                                <p className="text-text-secondary text-xs">S/N: {eq.serialNumber}</p>
                            </li>
                        ))}
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