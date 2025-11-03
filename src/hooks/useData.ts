import { useMemo, Dispatch } from 'react';
import { Client, Equipment, Inspection, FinancialRecord, Certificate, BackupData } from '../../types';
import { MOCK_CLIENTS, MOCK_EQUIPMENT, MOCK_INSPECTIONS, MOCK_FINANCIAL, MOCK_CERTIFICATES } from '../../data';
import { useIndexedDB } from './useIndexedDB';
import { useAuth } from '../context/AuthContext';
import { get } from '../idb';

export const useData = () => {
    const { currentUser } = useAuth();
    const dataKeyPrefix = useMemo(() => currentUser || 'guest', [currentUser]);

    const isInitialAdminLoad = currentUser === 'admin';

    // User-specific data states
    const [clients, setClients, clientsLoaded] = useIndexedDB<Client[]>(`${dataKeyPrefix}-clients`, isInitialAdminLoad ? MOCK_CLIENTS : []);
    const [equipment, setEquipment, equipmentLoaded] = useIndexedDB<Equipment[]>(`${dataKeyPrefix}-equipment`, isInitialAdminLoad ? MOCK_EQUIPMENT : []);
    const [inspections, setInspections, inspectionsLoaded] = useIndexedDB<Inspection[]>(`${dataKeyPrefix}-inspections`, isInitialAdminLoad ? MOCK_INSPECTIONS : []);
    const [financial, setFinancial, financialLoaded] = useIndexedDB<FinancialRecord[]>(`${dataKeyPrefix}-financial`, isInitialAdminLoad ? MOCK_FINANCIAL : []);
    const [certificates, setCertificates, certificatesLoaded] = useIndexedDB<Certificate[]>(`${dataKeyPrefix}-certificates`, isInitialAdminLoad ? MOCK_CERTIFICATES : []);
    
    // Auto-backup timestamp state
    const iDBLastBackup = useIndexedDB<string | null>(`${dataKeyPrefix}-lastBackupTimestamp`, null);
    const lastBackupTimestamp = iDBLastBackup[0];
    const lastBackupTimestampLoaded = iDBLastBackup[2];
    
    const isDataLoading = !clientsLoaded || !equipmentLoaded || !inspectionsLoaded || !financialLoaded || !certificatesLoaded || !lastBackupTimestampLoaded;

    // --- CRUD Handlers ---
    // Client
    const handleAddClient = (clientData: Omit<Client, 'id'>) => {
        const newClient: Client = { ...clientData, id: `cli-${crypto.randomUUID()}` };
        setClients(prev => [...prev, newClient]);
    };
    const handleUpdateClient = (updatedClient: Client) => {
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    };
    const handleDeleteClient = (clientId: string) => {
        setClients(prev => prev.filter(c => c.id !== clientId));
        setEquipment(prev => prev.filter(e => e.clientId !== clientId));
        setInspections(prev => prev.filter(i => i.clientId !== clientId));
        setFinancial(prev => prev.filter(f => f.clientId !== clientId));
    };
    
    // Equipment
    const handleAddEquipment = (equipmentData: Omit<Equipment, 'id'>) => {
        const newEquipment: Equipment = { ...equipmentData, id: `eq-${crypto.randomUUID()}` };
        setEquipment(prev => [...prev, newEquipment]);
    };
    const handleUpdateEquipment = (updatedEquipment: Equipment) => {
        setEquipment(prev => prev.map(eq => eq.id === updatedEquipment.id ? updatedEquipment : eq));
    };
    const handleDeleteEquipment = (equipmentId: string) => {
        setEquipment(prev => prev.filter(eq => eq.id !== equipmentId));
    };
    
    // Inspection
    const handleAddInspection = (inspectionData: Omit<Inspection, 'id'>) => {
        const newInspection: Inspection = { ...inspectionData, id: `ins-${crypto.randomUUID()}` };
        setInspections(prev => [...prev, newInspection]);
    };
    const handleUpdateInspection = (updatedInspection: Inspection) => {
        setInspections(prev => prev.map(insp => insp.id === updatedInspection.id ? updatedInspection : insp));
    };
    
    // Financial
    const handleAddFinancial = (recordData: Omit<FinancialRecord, 'id'>) => {
        const newRecord: FinancialRecord = { ...recordData, id: `fin-${crypto.randomUUID()}` };
        setFinancial(prev => [...prev, newRecord]);
    };

    // Certificate
    const handleAddCertificate = (inspection: Inspection) => {
        const issueDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(issueDate.getFullYear() + 1);

        const newCertificate: Certificate = {
            id: `cert-${crypto.randomUUID()}`,
            inspectionId: inspection.id,
            clientId: inspection.clientId,
            issueDate: issueDate.toISOString().split('T')[0],
            expiryDate: expiryDate.toISOString().split('T')[0],
        };
        setCertificates(prev => [...prev, newCertificate]);
    };

    // --- Data Handlers ---
    const handleImportData = (parsedData: BackupData) => {
        setClients(parsedData.clients || []);
        setEquipment(parsedData.equipment || []);
        setInspections(parsedData.inspections || []);
        setFinancial(parsedData.financial || []);
        setCertificates(parsedData.certificates || []);
    };
    
    const confirmAutoRestore = async () => {
        const dataSetKeys: ('clients' | 'equipment' | 'inspections' | 'financial' | 'certificates')[] = ['clients', 'equipment', 'inspections', 'financial', 'certificates'];
        const setters: Record<typeof dataSetKeys[number], Dispatch<any>> = {
            clients: setClients,
            equipment: setEquipment,
            inspections: setInspections,
            financial: setFinancial,
            certificates: setCertificates,
        };
        for (const key of dataSetKeys) {
            const backupValue = await get(`${dataKeyPrefix}-${key}_backup`);
            if (backupValue) {
                setters[key](backupValue);
            }
        }
    };

    return {
        clients, equipment, inspections, financial, certificates,
        isDataLoading,
        // Client
        handleAddClient, handleUpdateClient, handleDeleteClient,
        // Equipment
        handleAddEquipment, handleUpdateEquipment, handleDeleteEquipment,
        // Inspection
        handleAddInspection, handleUpdateInspection,
        // Financial
        handleAddFinancial,
        // Certificate
        handleAddCertificate,
        // Data
        handleImportData,
        lastBackupTimestamp,
        confirmAutoRestore,
    };
};