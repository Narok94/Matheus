import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { BackupData, CompanyProfile } from '../../types';
import { Card, Button, Input, FormField, ToggleSwitch, ConfirmationModal } from '../components/common';
import { LogoutIcon, DownloadIcon, UploadIcon, RestoreIcon, BuildingIcon } from '../components/Icons';

type Tab = 'profile' | 'system' | 'account';

const TabButton: React.FC<{ activeTab: Tab; tabName: Tab; label: string; onClick: (tab: Tab) => void; }> = ({ activeTab, tabName, label, onClick }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
            activeTab === tabName
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
        }`}
    >
        {label}
    </button>
);

const TabContent: React.FC<{ activeTab: Tab; tabName: Tab; children: ReactNode; }> = ({ activeTab, tabName, children }) => (
    <div className={`${activeTab === tabName ? 'block animate-fade-in' : 'hidden'}`}>
        {children}
    </div>
);


export const Settings: React.FC<{ showToast: (msg: string, type?: 'success' | 'error') => void }> = ({ showToast }) => {
    const { currentUserDetails, handleUpdateUser, handleLogout } = useAuth();
    const { clients, equipment, clientEquipment, inspections, financial, certificates, licenses, deliveries, expenses, recurringPayables, handleImportData, lastBackupTimestamp, confirmAutoRestore: confirmDataAutoRestore } = useData();
    const { theme, setTheme, companyProfile, setCompanyProfile, appSettings, handleImportSettings, confirmAutoRestoreSettings } = useSettings();

    const [activeTab, setActiveTab] = useState<Tab>('system');
    const [isImportConfirmOpen, setImportConfirmOpen] = useState(false);
    const [dataToImport, setDataToImport] = useState<BackupData | null>(null);
    const [isAutoRestoreConfirmOpen, setAutoRestoreConfirmOpen] = useState(false);
    
    const [localProfile, setLocalProfile] = useState<CompanyProfile>(companyProfile);
    const [userProfile, setUserProfile] = useState({
        fullName: currentUserDetails?.fullName || '',
    });

    useEffect(() => {
        if (currentUserDetails) {
            setUserProfile({
                fullName: currentUserDetails.fullName || '',
            });
        }
    }, [currentUserDetails]);

    useEffect(() => {
        setLocalProfile(companyProfile);
    }, [companyProfile]);
    
    const handleCompanyProfileSave = () => {
        setCompanyProfile(localProfile);
        showToast("Perfil da empresa atualizado!");
    };

    const handleUserSave = () => {
        if (currentUserDetails) {
            handleUpdateUser({
                ...currentUserDetails,
                fullName: userProfile.fullName,
            });
            showToast("Perfil atualizado com sucesso!");
        }
    };
    
    const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 512) { // 512KB limit
                showToast("O logotipo deve ser menor que 512KB.", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalProfile(prev => ({...prev, logo: reader.result as string}));
                showToast("Logotipo carregado. Clique em 'Salvar' para aplicar.", "success");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExportData = () => {
        const backupData: BackupData = {
            clients, equipment, clientEquipment, inspections, financial, certificates, licenses, deliveries, expenses, recurringPayables,
            companyProfile, appSettings,
        };
        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MDS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Backup exportado com sucesso!");
    };

    const handleFileImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsedData = JSON.parse(event.target?.result as string);
                if (!parsedData.clients || !parsedData.equipment) throw new Error("Arquivo de backup inválido.");
                setDataToImport(parsedData);
                setImportConfirmOpen(true);
            } catch (error) {
                showToast("Erro ao processar o arquivo de backup.", "error");
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    };
    
    const confirmImport = () => {
        if (!dataToImport) return;
        handleImportData(dataToImport);
        handleImportSettings(dataToImport);
        setDataToImport(null);
        setImportConfirmOpen(false);
        showToast("Dados importados com sucesso!");
    };
    
    const confirmAutoRestore = async () => {
        try {
            await confirmDataAutoRestore();
            await confirmAutoRestoreSettings();
            showToast("Backup restaurado com sucesso!");
        } catch (error) {
            showToast("Falha ao restaurar o backup.", "error");
        } finally {
            setAutoRestoreConfirmOpen(false);
        }
    };

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="flex border-b border-border mb-6">
                <TabButton activeTab={activeTab} tabName="system" label="Sistema" onClick={setActiveTab} />
                <TabButton activeTab={activeTab} tabName="profile" label="Perfil" onClick={setActiveTab} />
                <TabButton activeTab={activeTab} tabName="account" label="Conta" onClick={setActiveTab} />
            </div>

            <div className="flex-grow">
                <TabContent activeTab={activeTab} tabName="profile">
                    <div className="space-y-6">
                        <Card title="Meu Perfil">
                            <div className="space-y-4">
                                <FormField label="Nome Completo"><Input value={userProfile.fullName} onChange={(e) => setUserProfile(p => ({ ...p, fullName: e.target.value }))} /></FormField>
                                <div className="flex justify-end"><Button onClick={handleUserSave}>Salvar Perfil</Button></div>
                            </div>
                        </Card>
                    </div>
                </TabContent>
                
                <TabContent activeTab={activeTab} tabName="system">
                     <div className="space-y-6">
                        <Card title="Aparência">
                            <div className="flex items-center justify-between p-2">
                                <span className="text-text-primary font-medium">Modo Escuro</span>
                                <ToggleSwitch enabled={theme === 'dark'} onChange={(enabled) => setTheme(enabled ? 'dark' : 'light')} />
                            </div>
                        </Card>
                        <Card title="Perfil da Empresa">
                            <div className="space-y-4">
                                <FormField label="Nome da Empresa"><Input name="name" value={localProfile.name} onChange={handleProfileInputChange} /></FormField>
                                <FormField label="Logotipo da Empresa">
                                    <div className="flex items-center space-x-4 mt-2">
                                        <div className="w-16 h-16 bg-primary rounded-md flex items-center justify-center border border-border">
                                            {localProfile.logo ? (
                                                <img src={localProfile.logo} alt="Logotipo" className="w-full h-full object-contain" />
                                            ) : (
                                                <BuildingIcon className="w-8 h-8 text-text-secondary" />
                                            )}
                                        </div>
                                        <Button as="label" variant="secondary" className="cursor-pointer">
                                            <UploadIcon className="w-5 h-5 mr-2" />
                                            Alterar Logotipo
                                            <input type="file" accept="image/png, image/jpeg, image/svg+xml" className="hidden" onChange={handleLogoChange} />
                                        </Button>
                                    </div>
                                </FormField>
                                <div className="flex justify-end"><Button onClick={handleCompanyProfileSave}>Salvar Alterações</Button></div>
                            </div>
                        </Card>
                        <Card title="Backup e Restauração">
                            <ul className="divide-y divide-border">
                                <li className="flex justify-between items-center p-3">
                                    <div>
                                        <p className="font-semibold text-text-primary">Backup Manual</p>
                                        <p className="text-xs text-text-secondary">Exporte seus dados para um arquivo local.</p>
                                    </div>
                                    <Button onClick={handleExportData} variant="secondary" className="!p-2.5">
                                        <DownloadIcon className="w-5 h-5"/>
                                    </Button>
                                </li>
                                <li className="flex justify-between items-center p-3">
                                     <div>
                                        <p className="font-semibold text-text-primary">Importar Backup</p>
                                        <p className="text-xs text-text-secondary">Substitua os dados por um arquivo.</p>
                                    </div>
                                     <Button as="label" variant="secondary" className="cursor-pointer !p-2.5">
                                        <UploadIcon className="w-5 h-5"/>
                                        <input type="file" accept=".json" className="hidden" onChange={handleFileImportChange} />
                                     </Button>
                                </li>
                                {lastBackupTimestamp && (
                                     <li className="flex justify-between items-center p-3">
                                        <div>
                                            <p className="font-semibold text-text-primary">Restauração Automática</p>
                                            <p className="text-xs text-text-secondary">Último: {new Date(lastBackupTimestamp).toLocaleString('pt-BR')}</p>
                                        </div>
                                        <Button onClick={() => setAutoRestoreConfirmOpen(true)} variant="secondary" className="text-accent border-accent/30 hover:bg-accent/10 !p-2.5">
                                            <RestoreIcon className="w-5 h-5"/>
                                        </Button>
                                    </li>
                                )}
                            </ul>
                        </Card>
                    </div>
                </TabContent>

                <TabContent activeTab={activeTab} tabName="account">
                    <Card title="Sair da Conta">
                        <p className="text-text-secondary mb-4">Ao sair, você precisará fazer login novamente para acessar seus dados.</p>
                        <div className="flex justify-end">
                            <Button onClick={() => handleLogout('manual', showToast)} variant="secondary" className="border-status-reproved/50 text-status-reproved hover:bg-status-reproved/10"><LogoutIcon className="mr-2" />Confirmar Saída</Button>
                        </div>
                    </Card>
                </TabContent>
            </div>
            
            <ConfirmationModal isOpen={isImportConfirmOpen} onClose={() => setImportConfirmOpen(false)} onConfirm={confirmImport} title="Confirmar Importação" message="Isso substituirá todos os dados atuais pelos dados do backup. Esta ação não pode ser desfeita."/>
            <ConfirmationModal isOpen={isAutoRestoreConfirmOpen} onClose={() => setAutoRestoreConfirmOpen(false)} onConfirm={confirmAutoRestore} title="Confirmar Restauração" message="Isso substituirá todos os dados atuais pelos do último backup automático. Deseja continuar?"/>
        </div>
    );
};