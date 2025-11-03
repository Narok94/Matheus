import React from 'react';
import { useData } from '../context/DataContext';
import { Card, Button, EmptyState } from '../components/common';
import { CertificateIcon } from '../components/Icons';

export const Certificates: React.FC<{ onViewCertificate: (certificateId: string) => void }> = ({ onViewCertificate }) => {
    const { certificates, clients } = useData();
    return (
        <div className="p-4 space-y-4">
            {certificates.length > 0 ? certificates.map(cert => {
                const client = clients.find(c => c.id === cert.clientId);
                return (
                    <Card key={cert.id} className="cursor-pointer hover:border-accent transition-colors" onClick={() => onViewCertificate(cert.id)}>
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold text-text-primary">{client?.name}</h4>
                                <p className="text-sm text-text-secondary">Certificado #{cert.id.slice(-6).toUpperCase()}</p>
                                <p className="text-xs text-text-secondary">Válido até: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                            </div>
                            <Button variant="secondary" onClick={(e) => { e.stopPropagation(); onViewCertificate(cert.id); }}>Ver Detalhes</Button>
                        </div>
                    </Card>
                );
            }) : <EmptyState message="Nenhum certificado emitido." icon={<CertificateIcon className="w-12 h-12" />} />}
        </div>
    );
};