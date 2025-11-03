import { useMemo, Dispatch } from 'react';
import { Client, Equipment, Inspection, FinancialRecord, Certificate, BackupData, License, Delivery, Expense, LicenseStatus } from '../../types';
import { MOCK_CLIENTS, MOCK_EQUIPMENT, MOCK_INSPECTIONS, MOCK_FINANCIAL, MOCK_CERTIFICATES, MOCK_LICENSES, MOCK_DELIVERIES, MOCK_EXPENSES } from '../../data';
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
    const [licenses, setLicenses, licensesLoaded] = useIndexedDB<License[]>(`${dataKeyPrefix}-licenses`, isInitialAdminLoad ? MOCK_LICENSES : []);
    const [deliveries, setDeliveries, deliveriesLoaded] = useIndexedDB<Delivery[]>(`${dataKeyPrefix}-deliveries`, isInitialAdminLoad ? MOCK_DELIVERIES : []);
    const [expenses, setExpenses, expensesLoaded] = useIndexedDB<Expense[]>(`${dataKeyPrefix}-expenses`, isInitialAdminLoad ? MOCK_EXPENSES : []);
    
    // Auto-backup timestamp state
    const iDBLastBackup = useIndexedDB<string | null>(`${dataKeyPrefix}-lastBackupTimestamp`, null);
    const lastBackupTimestamp = iDBLastBackup[0];
    const lastBackupTimestampLoaded = iDBLastBackup[2];
    
    const isDataLoading = !clientsLoaded || !equipmentLoaded || !inspectionsLoaded || !financialLoaded || !certificatesLoaded || !lastBackupTimestampLoaded || !licensesLoaded || !deliveriesLoaded || !expensesLoaded;

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
        setCertificates(prev => prev.filter(cert => cert.clientId !== clientId));
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
    
    // Financial (Receivables)
    const handleAddFinancial = (recordData: Omit<FinancialRecord, 'id'>) => {
        const newRecord: FinancialRecord = { ...recordData, id: `fin-${crypto.randomUUID()}` };
        setFinancial(prev => [...prev, newRecord]);
    };

    // Expenses (Payables)
    const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { ...expenseData, id: `exp-${crypto.randomUUID()}` };
        setExpenses(prev => [...prev, newExpense]);
    };
    const handleUpdateExpense = (updatedExpense: Expense) => {
        setExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
    };
    const handleDeleteExpense = (expenseId: string) => {
        setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
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
    
    // License
    const handleUpdateLicense = (updatedLicense: License) => {
        setLicenses(prev => prev.map(l => l.id === updatedLicense.id ? updatedLicense : l));
    };

    // --- Data Handlers ---
    const handleImportData = (parsedData: BackupData) => {
        setClients(parsedData.clients || []);
        setEquipment(parsedData.equipment || []);
        setInspections(parsedData.inspections || []);
        setFinancial(parsedData.financial || []);
        setCertificates(parsedData.certificates || []);
        setLicenses(parsedData.licenses || []);
        setDeliveries(parsedData.deliveries || []);
        setExpenses(parsedData.expenses || []);
    };
    
    const confirmAutoRestore = async () => {
        const dataSetKeys: ('clients' | 'equipment' | 'inspections' | 'financial' | 'certificates' | 'licenses' | 'deliveries' | 'expenses')[] = ['clients', 'equipment', 'inspections', 'financial', 'certificates', 'licenses', 'deliveries', 'expenses'];
        const setters: Record<typeof dataSetKeys[number], Dispatch<any>> = {
            clients: setClients,
            equipment: setEquipment,
            inspections: setInspections,
            financial: setFinancial,
            certificates: setCertificates,
            licenses: setLicenses,
            deliveries: setDeliveries,
            expenses: setExpenses,
        };
        for (const key of dataSetKeys) {
            const backupValue = await get(`${dataKeyPrefix}-${key}_backup`);
            if (backupValue) {
                setters[key](backupValue);
            }
        }
    };

    return {
        clients, equipment, inspections, financial, certificates, licenses, deliveries, expenses,
        isDataLoading,
        // Client
        handleAddClient, handleUpdateClient, handleDeleteClient,
        // Equipment
        handleAddEquipment, handleUpdateEquipment, handleDeleteEquipment,
        // Inspection
        handleAddInspection, handleUpdateInspection,
        // Financial
        handleAddFinancial,
        // Expense
        handleAddExpense, handleUpdateExpense, handleDeleteExpense,
        // Certificate
        handleAddCertificate,
        // License
        handleUpdateLicense,
        // Data
        handleImportData,
        lastBackupTimestamp,
        confirmAutoRestore,
    };
};