import { useMemo, Dispatch, useEffect } from 'react';
import { Client, Equipment, Inspection, FinancialRecord, Certificate, BackupData, License, Delivery, Expense, PaymentStatus, ClientEquipment } from '../../types';
import { MOCK_CLIENTS, MOCK_EQUIPMENT, MOCK_INSPECTIONS, MOCK_FINANCIAL, MOCK_CERTIFICATES, MOCK_LICENSES, MOCK_DELIVERIES, MOCK_EXPENSES, MOCK_CLIENT_EQUIPMENT } from '../../data';
import { useIndexedDB } from './useIndexedDB';
import { useAuth } from '../context/AuthContext';
import { get } from '../idb';
import { parseLocalDate } from '../utils';

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
     const handleUpdateFinancial = (updatedRecord: FinancialRecord) => {
        setFinancial(prev => prev.map(rec => rec.id === updatedRecord.id ? updatedRecord : rec));
    };
    const handleDeleteFinancial = (recordId: string) => {
        const recordToDelete = financial.find(rec => rec.id === recordId);
        if (recordToDelete && recordToDelete.inspectionId.startsWith('recorrente-')) {
            const client = clients.find(c => c.id === recordToDelete.clientId);
            if (client && client.isRecurring && (client.paidInstallments || 0) > 0) {
                const updatedClient = {
                    ...client,
                    paidInstallments: (client.paidInstallments || 0) - 1,
                };
                handleUpdateClient(updatedClient);
            }
        }
        setFinancial(prev => prev.filter(rec => rec.id !== recordId));
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
    
    const handleMarkInstallmentAsPaid = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (!client || !client.isRecurring || !client.recurringAmount || !client.recurringInstallments || client.paidInstallments === undefined || !client.recurringCycleStart) {
            return;
        }

        const currentPaidInstallments = client.paidInstallments || 0;
        if (currentPaidInstallments >= client.recurringInstallments) {
            return; // All paid
        }

        const newPaidCount = currentPaidInstallments + 1;
        
        // Create financial record
        const issueDate = new Date();
        
        // --- CORRECTED DATE LOGIC ---
        const cycleStartDate = parseLocalDate(client.recurringCycleStart);
        const startYear = cycleStartDate.getFullYear();
        const startMonth = cycleStartDate.getMonth();
        const startDay = cycleStartDate.getDate();
        
        const targetMonth = startMonth + currentPaidInstallments;
        
        let dueDate = new Date(startYear, targetMonth, startDay);
        
        // If the day of month doesn't match, it means we rolled over to the next month
        // e.g., trying to set Nov 31 results in Dec 1.
        if (dueDate.getDate() !== startDay) {
            // In that case, we set the date to the last day of the intended month.
            // Day 0 of the *next* month gives us the last day of the *current* month.
            dueDate = new Date(startYear, targetMonth + 1, 0);
        }
        // --- END OF CORRECTION ---

        const newRecord: Omit<FinancialRecord, 'id'> = {
            clientId: client.id,
            inspectionId: `recorrente-${client.id}-${newPaidCount}`,
            description: `Pagamento Recorrente - Parcela ${newPaidCount}/${client.recurringInstallments}`,
            value: client.recurringAmount,
            issueDate: issueDate.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            paymentDate: issueDate.toISOString().split('T')[0],
            status: PaymentStatus.Pago,
        };
        handleAddFinancial(newRecord);

        // Update client
        const updatedClient = { ...client, paidInstallments: newPaidCount };
        handleUpdateClient(updatedClient);
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
        handleAddFinancial, handleUpdateFinancial, handleDeleteFinancial,
        // Expense
        handleAddExpense, handleUpdateExpense, handleDeleteExpense,
        // Certificate
        handleAddCertificate,
        // License
        handleUpdateLicense,
        // Recurring Payment
        handleMarkInstallmentAsPaid,
        // Data
        handleImportData,
        lastBackupTimestamp,
        confirmAutoRestore,
    };
};