import { useMemo, Dispatch, useEffect } from 'react';
import { Client, Equipment, Inspection, FinancialRecord, Certificate, BackupData, License, Delivery, Expense, PaymentStatus, ClientEquipment } from '../../types';
import { MOCK_CLIENTS, MOCK_EQUIPMENT, MOCK_INSPECTIONS, MOCK_FINANCIAL, MOCK_CERTIFICATES, MOCK_LICENSES, MOCK_DELIVERIES, MOCK_EXPENSES, MOCK_CLIENT_EQUIPMENT } from '../../data';
import { useIndexedDB } from './useIndexedDB';
import { useAuth } from '../context/AuthContext';
import { get } from '../idb';

export const useData = () => {
    const { currentUser } = useAuth();
    const dataKeyPrefix = useMemo(() => {
        if (!currentUser) return 'guest';
        return currentUser;
    }, [currentUser]);

    const isMockUser = useMemo(() => currentUser === 'admin', [currentUser]);

    // Initialization flag to prevent data loss on updates for mock users
    const [initialized, setInitialized, initializedLoaded] = useIndexedDB<boolean>(`${dataKeyPrefix}-initialized`, false);

    // User-specific data states
    const [clients, setClients, clientsLoaded] = useIndexedDB<Client[]>(`${dataKeyPrefix}-clients`, []);
    const [equipment, setEquipment, equipmentLoaded] = useIndexedDB<Equipment[]>(`${dataKeyPrefix}-equipment`, []);
    const [clientEquipment, setClientEquipment, clientEquipmentLoaded] = useIndexedDB<ClientEquipment[]>(`${dataKeyPrefix}-clientEquipment`, []);
    const [inspections, setInspections, inspectionsLoaded] = useIndexedDB<Inspection[]>(`${dataKeyPrefix}-inspections`, []);
    const [financial, setFinancial, financialLoaded] = useIndexedDB<FinancialRecord[]>(`${dataKeyPrefix}-financial`, []);
    const [certificates, setCertificates, certificatesLoaded] = useIndexedDB<Certificate[]>(`${dataKeyPrefix}-certificates`, []);
    const [licenses, setLicenses, licensesLoaded] = useIndexedDB<License[]>(`${dataKeyPrefix}-licenses`, []);
    const [deliveries, setDeliveries, deliveriesLoaded] = useIndexedDB<Delivery[]>(`${dataKeyPrefix}-deliveries`, []);
    const [expenses, setExpenses, expensesLoaded] = useIndexedDB<Expense[]>(`${dataKeyPrefix}-expenses`, []);
    
    // Auto-backup timestamp state
    const iDBLastBackup = useIndexedDB<string | null>(`${dataKeyPrefix}-lastBackupTimestamp`, null);
    const lastBackupTimestamp = iDBLastBackup[0];
    const lastBackupTimestampLoaded = iDBLastBackup[2];
    
    const isDataLoading = !clientsLoaded || !equipmentLoaded || !clientEquipmentLoaded || !inspectionsLoaded || !financialLoaded || !certificatesLoaded || !lastBackupTimestampLoaded || !licensesLoaded || !deliveriesLoaded || !expensesLoaded || !initializedLoaded;

    // Effect to seed mock data for the 'admin' user only once.
    useEffect(() => {
        if (initializedLoaded && !initialized && isMockUser) {
            console.log("Seeding mock data for admin user...");
            setClients(MOCK_CLIENTS);
            setEquipment(MOCK_EQUIPMENT);
            setClientEquipment(MOCK_CLIENT_EQUIPMENT);
            setInspections(MOCK_INSPECTIONS);
            setFinancial(MOCK_FINANCIAL);
            setCertificates(MOCK_CERTIFICATES);
            setLicenses(MOCK_LICENSES);
            setDeliveries(MOCK_DELIVERIES);
            setExpenses(MOCK_EXPENSES);
            setInitialized(true);
        }
    }, [initialized, initializedLoaded, isMockUser, setClients, setEquipment, setClientEquipment, setInspections, setFinancial, setCertificates, setLicenses, setDeliveries, setExpenses, setInitialized]);


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
        setClientEquipment(prev => prev.filter(e => e.clientId !== clientId));
        setInspections(prev => prev.filter(i => i.clientId !== clientId));
        setFinancial(prev => prev.filter(f => f.clientId !== clientId));
        setCertificates(prev => prev.filter(cert => cert.clientId !== clientId));
    };
    
    // Equipment (Product Catalog)
    const handleAddEquipment = (equipmentData: Omit<Equipment, 'id'>) => {
        const newEquipment: Equipment = { ...equipmentData, id: `eq-${crypto.randomUUID()}` };
        setEquipment(prev => [...prev, newEquipment]);
    };
    const handleUpdateEquipment = (updatedEquipment: Equipment) => {
        setEquipment(prev => prev.map(eq => eq.id === updatedEquipment.id ? updatedEquipment : eq));
    };
    const handleDeleteEquipment = (equipmentId: string) => {
        setEquipment(prev => prev.filter(eq => eq.id !== equipmentId));
        setClientEquipment(prev => prev.filter(ceq => ceq.equipmentId !== equipmentId));
    };
    
    // Client Equipment (Asset)
    const handleAddClientEquipment = (clientEquipmentData: Omit<ClientEquipment, 'id'>) => {
        const newClientEquipment: ClientEquipment = { ...clientEquipmentData, id: `ceq-${crypto.randomUUID()}` };
        setClientEquipment(prev => [...prev, newClientEquipment]);
    };
    const handleUpdateClientEquipment = (updatedClientEquipment: ClientEquipment) => {
        setClientEquipment(prev => prev.map(ceq => ceq.id === updatedClientEquipment.id ? updatedClientEquipment : ceq));
    };
    const handleDeleteClientEquipment = (clientEquipmentId: string) => {
        setClientEquipment(prev => prev.filter(ceq => ceq.id !== clientEquipmentId));
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
    const handleAddFinancials = (recordsData: Omit<FinancialRecord, 'id'>[]) => {
        const newRecords: FinancialRecord[] = recordsData.map(data => ({ ...data, id: `fin-${crypto.randomUUID()}` }));
        setFinancial(prev => [...prev, ...newRecords]);
    };
     const handleUpdateFinancial = (updatedRecord: FinancialRecord) => {
        setFinancial(prev => prev.map(rec => rec.id === updatedRecord.id ? updatedRecord : rec));
    };
    const handleDeleteFinancial = (recordId: string) => {
        setFinancial(prev => prev.filter(rec => rec.id !== recordId));
    };
    const handleDeleteFinancialSeries = (groupId: string, fromInstance: number) => {
        setFinancial(prev => prev.filter(rec => {
            if (rec.recurringGroupId !== groupId) return true; // Not part of the series
            if (rec.recurringInstance === undefined || rec.recurringInstance < fromInstance) return true; // Before the starting point
            if (rec.status === PaymentStatus.Pago) return true; // Keep if it's already paid, regardless of instance
            return false; // Otherwise, delete it
        }));
    };

    // Expenses (Payables)
    const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { ...expenseData, id: `exp-${crypto.randomUUID()}` };
        setExpenses(prev => [...prev, newExpense]);
    };
    const handleAddExpenses = (expensesData: Omit<Expense, 'id'>[]) => {
        const newExpenses: Expense[] = expensesData.map(data => ({ ...data, id: `exp-${crypto.randomUUID()}` }));
        setExpenses(prev => [...prev, ...newExpenses]);
    };
    const handleUpdateExpense = (updatedExpense: Expense) => {
        setExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
    };
    const handleDeleteExpense = (expenseId: string) => {
        setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    };
    const handleDeleteExpenseSeries = (groupId: string, fromInstance: number) => {
        setExpenses(prev => prev.filter(exp => {
            if (exp.recurringGroupId !== groupId) return true;
            if (exp.recurringInstance === undefined || exp.recurringInstance < fromInstance) return true;
            if (exp.status === PaymentStatus.Pago) return true;
            return false;
        }));
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
        setClientEquipment(parsedData.clientEquipment || []);
        setInspections(parsedData.inspections || []);
        setFinancial(parsedData.financial || []);
        setCertificates(parsedData.certificates || []);
        setLicenses(parsedData.licenses || []);
        setDeliveries(parsedData.deliveries || []);
        setExpenses(parsedData.expenses || []);
    };
    
    const confirmAutoRestore = async () => {
        const dataSetKeys: (keyof Omit<BackupData, 'companyProfile' | 'appSettings'>)[] = ['clients', 'equipment', 'clientEquipment', 'inspections', 'financial', 'certificates', 'licenses', 'deliveries', 'expenses'];
        const setters: Record<typeof dataSetKeys[number], Dispatch<any>> = {
            clients: setClients,
            equipment: setEquipment,
            clientEquipment: setClientEquipment,
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
        clients, equipment, clientEquipment, inspections, financial, certificates, licenses, deliveries, expenses,
        isDataLoading,
        // Client
        handleAddClient, handleUpdateClient, handleDeleteClient,
        // Equipment (Product)
        handleAddEquipment, handleUpdateEquipment, handleDeleteEquipment,
        // Client Equipment (Asset)
        handleAddClientEquipment, handleUpdateClientEquipment, handleDeleteClientEquipment,
        // Inspection
        handleAddInspection, handleUpdateInspection,
        // Financial
        handleAddFinancial, handleAddFinancials, handleUpdateFinancial, handleDeleteFinancial, handleDeleteFinancialSeries,
        // Expense
        handleAddExpense, handleAddExpenses, handleUpdateExpense, handleDeleteExpense, handleDeleteExpenseSeries,
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