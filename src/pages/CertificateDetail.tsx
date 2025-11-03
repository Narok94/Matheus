import React, { useRef } from 'react';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { Button } from '../components/common';
import { InspecProLogo, ShareIcon } from '../components/Icons';

export const CertificateDetail: React.FC<{ certificateId: string }> = ({ certificateId }) => {
    const { certificates, inspections, clients, equipment } = useData();
    const { companyProfile } = useSettings();
    const printRef = useRef<HTMLDivElement>(null);

    const certificate = certificates.find(c => c.id === certificateId);
    if (!certificate) return <p className="p-4">Certificado não encontrado.</p>;

    const inspection = inspections.find(i => i.id === certificate.inspectionId);
    if (!inspection) return <p className="p-4">Inspeção relacionada não encontrada.</p>;
    
    const client = clients.find(c => c.id === certificate.clientId);
    if (!client) return <p className="p-4">Cliente não encontrado.</p>;

    const certifiedEquipmentIds = inspection.inspectedItems.map(item => item.equipmentId);
    const certifiedEquipment = equipment.filter(e => certifiedEquipmentIds.includes(e.id));

    const handleExport = () => {
        window.print();
    };


    return (
        <div className="p-4">
             <style>{`
                @media print {
                    body, html { visibility: hidden; margin: 0; padding: 0; }
                    .print-section, .print-section * { visibility: visible; }
                    .print-section { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        margin: 0; 
                        padding: 1rem; 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact;
                    }
                    .no-print { display: none; }
                }
            `}</style>
            <div className="flex justify-end mb-4 no-print">
                <Button onClick={handleExport}>
                    <ShareIcon className="w-5 h-5 mr-2" />
                    Salvar / Compartilhar
                </Button>
            </div>
            <div ref={printRef} className="bg-secondary p-4 md:p-8 rounded-lg shadow-lg border border-border print-section">
                <div className="cert-header flex flex-col md:flex-row justify-between items-start pb-4 border-b border-border mb-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-accent cert-title">Certificado de Inspeção</h1>
                        <p className="text-text-secondary">Nº {certificate.id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-left md:text-right mt-4 md:mt-0">
                        <p className="font-bold text-text-primary">{companyProfile.name}</p>
                        <div className="w-12 h-12 ml-auto mt-2 hidden md:block">
                            <InspecProLogo className="text-accent" />
                        </div>
                    </div>
                </div>

                <div className="my-6">
                    <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-2 mb-4">Detalhes do Cliente</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm info-grid">
                        <div className="info-item"><p className="label text-text-secondary">Cliente:</p><p className="value font-semibold text-text-primary">{client.name}</p></div>
                        <div className="info-item"><p className="label text-text-secondary">Documento:</p><p className="value font-semibold text-text-primary">{client.document}</p></div>
                        <div className="info-item col-span-1 md:col-span-2"><p className="label text-text-secondary">Endereço:</p><p className="value font-semibold text-text-primary">{client.address}, {client.city}</p></div>
                        <div className="info-item"><p className="label text-text-secondary">Contato:</p><p className="value font-semibold text-text-primary">{client.contact}</p></div>
                    </div>
                </div>

                <div className="my-6">
                     <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-2 mb-4">Detalhes da Certificação</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-sm info-grid">
                        <div className="info-item"><p className="label text-text-secondary">Data da Inspeção:</p><p className="value font-semibold text-text-primary">{new Date(inspection.date).toLocaleDateString()}</p></div>
                        <div className="info-item"><p className="label text-text-secondary">Data de Emissão:</p><p className="value font-semibold text-text-primary">{new Date(certificate.issueDate).toLocaleDateString()}</p></div>
                        <div className="info-item"><p className="label text-text-secondary">Data de Vencimento:</p><p className="value font-semibold text-text-primary">{new Date(certificate.expiryDate).toLocaleDateString()}</p></div>
                     </div>
                </div>

                <div className="my-6">
                    <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-2 mb-4">Equipamentos Aprovados</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 border-b border-border bg-primary/50 text-sm font-semibold text-text-secondary">Equipamento</th>
                                    <th className="p-2 border-b border-border bg-primary/50 text-sm font-semibold text-text-secondary">Nº de Série</th>
                                    <th className="p-2 border-b border-border bg-primary/50 text-sm font-semibold text-text-secondary">Categoria</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certifiedEquipment.map(eq => (
                                    <tr key={eq.id}>
                                        <td className="p-2 border-b border-border text-sm text-text-primary">{eq.name}</td>
                                        <td className="p-2 border-b border-border text-sm text-text-primary">{eq.serialNumber}</td>
                                        <td className="p-2 border-b border-border text-sm text-text-primary">{eq.category}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-border text-center text-xs text-text-secondary cert-footer">
                    <p>Este certificado confirma que os equipamentos listados foram inspecionados de acordo com as normas vigentes e aprovados na data indicada.</p>
                    <p className="mt-2 font-semibold">{companyProfile.name}</p>
                </div>
            </div>
        </div>
    );
};