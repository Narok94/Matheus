import { Client, Equipment, Inspection, FinancialRecord, Certificate, License, Delivery, Expense, InspectionStatus, PaymentStatus, DeliveryStatus, LicenseStatus, InspectedItem, InspectionItemStatus, ClientEquipment } from './types';

// --- MOCK DATA FOR 'admin' USER ---
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// --- CLIENTS ---
export const MOCK_CLIENTS: Client[] = [
    {
        id: 'cli-001', name: 'Lili Coutinho Bolos', document: '12.345.678/0001-90', address: 'Rua das Flores, 123', city: 'São Paulo',
        contactName: 'Lili Coutinho', contact: '(11) 98765-4321', email: 'contato@lilicoutinho.com',
        isRecurring: true, recurringAmount: 150, recurringInstallments: 12, recurringCycleStart: formatDate(addDays(today, -60)), paidInstallments: 2,
    },
    {
        id: 'cli-002', name: 'IT De Moraes Me', document: '98.765.432/0001-10', address: 'Avenida Principal, 456', city: 'Rio de Janeiro',
        contactName: 'Itamar de Moraes', contact: '(21) 91234-5678', email: 'itamar@moraesme.com', isRecurring: false,
    },
    {
        id: 'cli-003', name: 'Oficina Mecânica Veloz', document: '45.678.912/0001-33', address: 'Rua dos Motores, 789', city: 'Belo Horizonte',
        contactName: 'Carlos Alberto', contact: '(31) 95555-1234', email: 'carlos@velozmecanica.com.br', isRecurring: false,
    },
    {
        id: 'cli-004', name: 'Restaurante Sabor Divino', document: '23.456.789/0001-44', address: 'Praça da Gastronomia, 10', city: 'Curitiba',
        contactName: 'Ana Paula', contact: '(41) 98888-7777', email: 'ana.paula@sabordivino.com',
        isRecurring: true, recurringAmount: 250, recurringInstallments: 6, recurringCycleStart: formatDate(addDays(today, -30)), paidInstallments: 1,
    },
    {
        id: 'cli-005', name: 'Condomínio Edifício Central', document: '34.567.891/0001-55', address: 'Rua Central, 1500', city: 'Porto Alegre',
        contactName: 'Sra. Marta (Síndica)', contact: '(51) 97777-8888', email: 'sindica@edcentral.com', isRecurring: false,
    }
];

// --- EQUIPMENT (PRODUCT CATALOG) ---
export const MOCK_EQUIPMENT: Equipment[] = [
    { id: 'prod-001', name: 'Extintor CO2 6kg', category: 'Extintor', unitOfMeasure: 'Unidade', capacity: '6kg', manufacturer: 'Extinpel' },
    { id: 'prod-002', name: 'Extintor AP 10L', category: 'Extintor', unitOfMeasure: 'Unidade', capacity: '10L', manufacturer: 'Bucka' },
    { id: 'prod-003', name: 'Hidrante de Parede', category: 'Hidrante', unitOfMeasure: 'Unidade', capacity: '2.5"', manufacturer: 'Metalcasty' },
    { id: 'prod-004', name: 'Extintor PQS 4kg', category: 'Extintor', unitOfMeasure: 'Unidade', capacity: '4kg', manufacturer: 'Resil' },
    { id: 'prod-005', name: 'Sinalização de Rota de Fuga', category: 'Sinalização', unitOfMeasure: 'Kit', capacity: '15 placas', manufacturer: 'Sinalize' },
    { id: 'prod-006', name: 'Extintor PQS 6kg', category: 'Extintor', unitOfMeasure: 'Unidade', capacity: '6kg', manufacturer: 'Resil' },
];

// --- CLIENT EQUIPMENT (ASSETS) ---
export const MOCK_CLIENT_EQUIPMENT: ClientEquipment[] = [
    // Lili Coutinho Bolos
    { id: 'asset-001', clientId: 'cli-001', equipmentId: 'prod-001', serialNumber: 'CO2-A1B2C3', expiryDate: formatDate(addDays(today, 180)), location: "Cozinha", status: InspectionStatus.Aprovado, lastInspectionDate: formatDate(addDays(today, -185)) },
    { id: 'asset-002', clientId: 'cli-001', equipmentId: 'prod-002', serialNumber: 'AP-D4E5F6', expiryDate: formatDate(addDays(today, 25)), location: "Estoque", status: InspectionStatus.Pendente, lastInspectionDate: formatDate(addDays(today, -340)) },
    // IT De Moraes Me
    { id: 'asset-003', clientId: 'cli-002', equipmentId: 'prod-003', serialNumber: 'HID-G7H8I9', expiryDate: formatDate(addDays(today, 365)), location: "Corredor Térreo", status: InspectionStatus.Aprovado, lastInspectionDate: formatDate(addDays(today, -10)) },
    // Oficina Mecânica Veloz
    { id: 'asset-004', clientId: 'cli-003', equipmentId: 'prod-004', serialNumber: 'PQS-J1K2L3', expiryDate: formatDate(addDays(today, -15)), location: "Pátio", status: InspectionStatus.Reprovado, lastInspectionDate: formatDate(addDays(today, -380)) },
    { id: 'asset-005', clientId: 'cli-003', equipmentId: 'prod-005', serialNumber: 'N/A', expiryDate: formatDate(addDays(today, 730)), location: "Saídas de Emergência", status: InspectionStatus.Agendada },
    // Condomínio Edifício Central
    { id: 'asset-006', clientId: 'cli-005', equipmentId: 'prod-006', serialNumber: 'PQS-M4N5P6', expiryDate: formatDate(addDays(today, 88)), location: "Hall de Entrada", status: InspectionStatus.Agendada },
    { id: 'asset-007', clientId: 'cli-005', equipmentId: 'prod-006', serialNumber: 'PQS-Q7R8S9', expiryDate: formatDate(addDays(today, 88)), location: "Garagem G1", status: InspectionStatus.Agendada },
];


// --- INSPECTIONS & Inspected Items ---
const MOCK_INSPECTED_ITEMS: Record<string, InspectedItem[]> = {
    'ins-001': [
        { clientEquipmentId: 'asset-001', location: 'Cozinha Principal', situation: InspectionItemStatus.Conforme, suggestedAction: 'Nenhuma' },
        { clientEquipmentId: 'asset-002', location: 'Área de Estoque', situation: InspectionItemStatus.NaoConforme, suggestedAction: 'Recarga Imediata' },
    ],
    'ins-002': [
        { clientEquipmentId: 'asset-003', location: 'Corredor Térreo', situation: InspectionItemStatus.Conforme, suggestedAction: 'Nenhuma' },
    ],
    'ins-003': [
        { clientEquipmentId: 'asset-004', location: 'Pátio de Serviços', situation: InspectionItemStatus.NaoConforme, suggestedAction: 'Substituição do manômetro e recarga.' },
    ],
};

export const MOCK_INSPECTIONS: Inspection[] = [
    { id: 'ins-001', clientId: 'cli-001', inspectedItems: MOCK_INSPECTED_ITEMS['ins-001'], date: formatDate(addDays(today, -30)), inspector: 'Carlos Pereira', observations: 'Extintor de água próximo do vencimento da recarga.', status: InspectionStatus.Pendente },
    { id: 'ins-002', clientId: 'cli-002', inspectedItems: MOCK_INSPECTED_ITEMS['ins-002'], date: formatDate(addDays(today, -10)), inspector: 'Admin', observations: 'Tudo conforme.', status: InspectionStatus.Aprovado },
    { id: 'ins-003', clientId: 'cli-003', inspectedItems: MOCK_INSPECTED_ITEMS['ins-003'], date: formatDate(addDays(today, -5)), inspector: 'Carlos Pereira', observations: 'Equipamento reprovado por baixa pressão.', status: InspectionStatus.Reprovado },
    { id: 'ins-004', clientId: 'cli-005', inspectedItems: [], date: formatDate(addDays(today, 15)), inspector: 'Admin', observations: 'Vistoria geral do condomínio agendada.', status: InspectionStatus.Agendada },
];

// --- FINANCIAL RECORDS (RECEIVABLES) ---
export const MOCK_FINANCIAL: FinancialRecord[] = [
    // From Screenshot
    { id: 'fin-001', clientId: 'cli-002', inspectionId: 'ins-002', description: '2ª parcela da Alt de endereço, Alf, CLCB e CMVS.', value: 1300.00, issueDate: formatDate(addDays(today, -45)), dueDate: formatDate(addDays(today, 10)), status: PaymentStatus.Pendente },
    { id: 'fin-002', clientId: 'cli-001', inspectionId: 'ins-001', description: '1 parcela processo de Alteração de atividades, CMVS, Alf e CLCB.', value: 844.00, issueDate: formatDate(addDays(today, -30)), dueDate: formatDate(addDays(today, 25)), status: PaymentStatus.Pendente },
    { id: 'fin-003', clientId: 'cli-001', inspectionId: 'ins-001', description: 'Parcela final do proc de alteração de atividades, CMVS, Alf e CLCB.', value: 844.00, issueDate: formatDate(addDays(today, -30)), dueDate: formatDate(addDays(today, 55)), status: PaymentStatus.Pendente },
    // Additional examples
    { id: 'fin-004', clientId: 'cli-003', inspectionId: 'ins-003', description: 'Serviço de vistoria e recarga', value: 350.50, issueDate: formatDate(addDays(today, -5)), dueDate: formatDate(addDays(today, -2)), status: PaymentStatus.Pendente }, // Atrasado
    { id: 'fin-005', clientId: 'cli-004', inspectionId: '', description: 'Taxa de consultoria mensal', value: 500.00, issueDate: formatDate(addDays(today, -10)), dueDate: formatDate(addDays(today, -1)), paymentDate: formatDate(addDays(today, -1)), status: PaymentStatus.Pago },
    { id: 'fin-006', clientId: 'cli-005', inspectionId: '', description: 'Sinal para vistoria geral', value: 1200.00, issueDate: formatDate(addDays(today, 0)), dueDate: formatDate(addDays(today, 7)), status: PaymentStatus.Pendente },
];

// --- CERTIFICATES ---
export const MOCK_CERTIFICATES: Certificate[] = [
    { id: 'cert-001', inspectionId: 'ins-002', clientId: 'cli-002', issueDate: formatDate(addDays(today, -10)), expiryDate: formatDate(addDays(today, 355)) },
];

// --- LICENSES ---
export const MOCK_LICENSES: License[] = [
    { id: 'lic-001', clientId: 'cli-004', type: 'Alvará de Funcionamento', issueDate: formatDate(addDays(today, -300)), expiryDate: formatDate(addDays(today, 65)), status: LicenseStatus.Pendente },
    { id: 'lic-002', clientId: 'cli-001', type: 'AVCB', issueDate: formatDate(addDays(today, -1000)), expiryDate: formatDate(addDays(today, -600)), status: LicenseStatus.Renovada },
];

// --- DELIVERIES ---
export const MOCK_DELIVERIES: Delivery[] = [
    { id: 'del-001', clientId: 'cli-003', description: 'Entrega de 1 extintor PQS 4kg novo', deliveryDate: formatDate(addDays(today, 3)), status: DeliveryStatus.Pendente },
    { id: 'del-002', clientId: 'cli-001', description: 'Entrega de material de sinalização', deliveryDate: formatDate(addDays(today, -20)), status: DeliveryStatus.Entregue },
];

// --- EXPENSES (PAYABLES) ---
export const MOCK_EXPENSES: Expense[] = [
    { id: 'exp-001', description: 'Compra de manômetros', supplier: 'Fornecedor XYZ', value: 250.00, dueDate: formatDate(addDays(today, 12)), status: PaymentStatus.Pendente },
    { id: 'exp-002', description: 'Aluguel do escritório', value: 1500.00, dueDate: formatDate(addDays(today, -2)), status: PaymentStatus.Pago, paymentDate: formatDate(addDays(today, -2)) },
    { id: 'exp-003', description: 'Conta de Energia', supplier: 'Light', value: 450.80, dueDate: formatDate(addDays(today, -1)), status: PaymentStatus.Pendente }, // Atrasado
];