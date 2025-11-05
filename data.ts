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
    },
    {
        id: 'cli-006', name: 'Academia Corpo em Movimento', document: '11.222.333/0001-44', address: 'Rua da Malhação, 500', city: 'Salvador',
        contactName: 'Ricardo Fitness', contact: '(71) 99999-0000', email: 'ricardo@corpoemmovimento.com.br',
        isRecurring: true, recurringAmount: 300, recurringInstallments: 12, recurringCycleStart: formatDate(addDays(today, -150)), paidInstallments: 5,
    },
    {
        id: 'cli-007', name: 'Escola Aprender Mais', document: '22.333.444/0001-55', address: 'Avenida do Saber, 1024', city: 'Fortaleza',
        contactName: 'Diretora Maria', contact: '(85) 98888-1111', email: 'diretoria@aprendermais.edu.br', isRecurring: false,
    },
    {
        id: 'cli-008', name: 'Startup InovaTech', document: '33.444.555/0001-66', address: 'Hub de Inovação, Sala 101', city: 'Florianópolis',
        contactName: 'Júlia Dev', contact: '(48) 97777-2222', email: 'julia@inovatech.io',
        isRecurring: true, recurringAmount: 450, recurringInstallments: 12, recurringCycleStart: formatDate(addDays(today, -10)), paidInstallments: 0,
    },
    {
        id: 'cli-009', name: 'Advocacia Legal & Justo', document: '44.555.666/0001-77', address: 'Praça da Justiça, 25', city: 'Brasília',
        contactName: 'Dr. Roberto Legal', contact: '(61) 96666-3333', email: 'roberto@legaljusto.adv.br', isRecurring: false,
    },
    {
        id: 'cli-010', name: 'Padaria Pão Quente', document: '55.666.777/0001-88', address: 'Rua do Trigo, 80', city: 'Recife',
        contactName: 'Seu Manuel', contact: '(81) 95555-4444', email: 'contato@paoquente.com',
        isRecurring: true, recurringAmount: 95, recurringInstallments: 24, recurringCycleStart: formatDate(addDays(today, -5)), paidInstallments: 0,
    },
];

// --- EQUIPMENT (PRODUCT CATALOG) ---
export const MOCK_EQUIPMENT: Equipment[] = [
    { id: 'prod-001', name: 'Extintor CO2 6kg', category: 'Extintor', unitOfMeasure: 'Unidade', capacity: '6kg', manufacturer: 'Extinpel', costPrice: 180, salePrice: 250 },
    { id: 'prod-002', name: 'Extintor AP 10L', category: 'Extintor', unitOfMeasure: 'Unidade', capacity: '10L', manufacturer: 'Bucka', costPrice: 90, salePrice: 160 },
    { id: 'prod-003', name: 'Hidrante de Parede', category: 'Hidrante', unitOfMeasure: 'Unidade', capacity: '2.5"', manufacturer: 'Metalcasty', costPrice: 450, salePrice: 600 },
    { id: 'prod-004', name: 'Extintor PQS 4kg', category: 'Extintor', unitOfMeasure: 'Unidade', capacity: '4kg', manufacturer: 'Resil', costPrice: 75, salePrice: 130 },
    { id: 'prod-005', name: 'Sinalização de Rota de Fuga', category: 'Sinalização', unitOfMeasure: 'Kit', capacity: '15 placas', manufacturer: 'Sinalize', costPrice: 120, salePrice: 200 },
    { id: 'prod-006', name: 'Extintor PQS 6kg', category: 'Extintor', unitOfMeasure: 'Unidade', capacity: '6kg', manufacturer: 'Resil', costPrice: 85, salePrice: 150 },
    { id: 'prod-007', name: 'Alarme de Incêndio Central', category: 'Alarme', unitOfMeasure: 'Unidade', capacity: '24V', manufacturer: 'Intelbras', costPrice: 350, salePrice: 550 },
    { id: 'prod-008', name: 'Mangueira de Incêndio 15m', category: 'Hidrante', unitOfMeasure: 'Unidade', capacity: '1.5"', manufacturer: 'Bombeiro Flex', costPrice: 200, salePrice: 320 },
    { id: 'prod-009', name: 'Extintor PQS 12kg (Carreta)', category: 'Extintor', unitOfMeasure: 'Unidade', capacity: '12kg', manufacturer: 'Extinpel', costPrice: 300, salePrice: 480 },
    { id: 'prod-010', name: 'Kit Iluminação de Emergência', category: 'Sinalização', unitOfMeasure: 'Kit', capacity: '5 lâmpadas', manufacturer: 'Lumine', costPrice: 150, salePrice: 280 },
];

// --- CLIENT EQUIPMENT (ASSETS) ---
export const MOCK_CLIENT_EQUIPMENT: ClientEquipment[] = [
    // Lili Coutinho Bolos (cli-001)
    { id: 'asset-001', clientId: 'cli-001', equipmentId: 'prod-001', serialNumber: 'CO2-A1B2C3', expiryDate: formatDate(addDays(today, 180)), location: "Cozinha", status: InspectionStatus.Aprovado, lastInspectionDate: formatDate(addDays(today, -185)) },
    { id: 'asset-002', clientId: 'cli-001', equipmentId: 'prod-002', serialNumber: 'AP-D4E5F6', expiryDate: formatDate(addDays(today, 25)), location: "Estoque", status: InspectionStatus.Pendente, lastInspectionDate: formatDate(addDays(today, -340)) },
    // IT De Moraes Me (cli-002)
    { id: 'asset-003', clientId: 'cli-002', equipmentId: 'prod-003', serialNumber: 'HID-G7H8I9', expiryDate: formatDate(addDays(today, 365)), location: "Corredor Térreo", status: InspectionStatus.Aprovado, lastInspectionDate: formatDate(addDays(today, -10)) },
    // Oficina Mecânica Veloz (cli-003)
    { id: 'asset-004', clientId: 'cli-003', equipmentId: 'prod-004', serialNumber: 'PQS-J1K2L3', expiryDate: formatDate(addDays(today, -15)), location: "Pátio", status: InspectionStatus.Reprovado, lastInspectionDate: formatDate(addDays(today, -380)) },
    { id: 'asset-005', clientId: 'cli-003', equipmentId: 'prod-005', serialNumber: 'N/A', expiryDate: formatDate(addDays(today, 730)), location: "Saídas de Emergência", status: InspectionStatus.Agendada },
    // Condomínio Edifício Central (cli-005)
    { id: 'asset-006', clientId: 'cli-005', equipmentId: 'prod-006', serialNumber: 'PQS-M4N5P6', expiryDate: formatDate(addDays(today, 88)), location: "Hall de Entrada", status: InspectionStatus.Agendada },
    { id: 'asset-007', clientId: 'cli-005', equipmentId: 'prod-006', serialNumber: 'PQS-Q7R8S9', expiryDate: formatDate(addDays(today, 88)), location: "Garagem G1", status: InspectionStatus.Agendada },
    // Academia Corpo em Movimento (cli-006)
    { id: 'asset-008', clientId: 'cli-006', equipmentId: 'prod-002', serialNumber: 'AP-ACADEMIA-01', expiryDate: formatDate(addDays(today, 20)), location: "Sala de Musculação", status: InspectionStatus.Pendente, lastInspectionDate: formatDate(addDays(today, -345)) },
    { id: 'asset-009', clientId: 'cli-006', equipmentId: 'prod-006', serialNumber: 'PQS-ACADEMIA-02', expiryDate: formatDate(addDays(today, 20)), location: "Recepção", status: InspectionStatus.Pendente, lastInspectionDate: formatDate(addDays(today, -345)) },
    // Escola Aprender Mais (cli-007)
    { id: 'asset-010', clientId: 'cli-007', equipmentId: 'prod-009', serialNumber: 'CARRETA-ESCOLA-01', expiryDate: formatDate(addDays(today, 400)), location: "Pátio Principal", status: InspectionStatus.Aprovado, lastInspectionDate: formatDate(addDays(today, -20)) },
    { id: 'asset-011', clientId: 'cli-007', equipmentId: 'prod-008', serialNumber: 'MANG-ESCOLA-01', expiryDate: formatDate(addDays(today, 800)), location: "Corredor Ala B", status: InspectionStatus.Agendada },
    // Startup InovaTech (cli-008)
    { id: 'asset-012', clientId: 'cli-008', equipmentId: 'prod-001', serialNumber: 'CO2-TECH-01', expiryDate: formatDate(addDays(today, -5)), location: "Sala de Servidores", status: InspectionStatus.Reprovado, lastInspectionDate: formatDate(addDays(today, -370)) },
    { id: 'asset-013', clientId: 'cli-008', equipmentId: 'prod-007', serialNumber: 'ALM-TECH-01', expiryDate: formatDate(addDays(today, 1500)), location: "Escritório", status: InspectionStatus.Aprovado, lastInspectionDate: formatDate(addDays(today, -30)) },
    // Padaria Pão Quente (cli-010)
    { id: 'asset-014', clientId: 'cli-010', equipmentId: 'prod-004', serialNumber: 'PQS-PADARIA-01', expiryDate: formatDate(addDays(today, 120)), location: "Cozinha", status: InspectionStatus.Aprovado, lastInspectionDate: formatDate(addDays(today, -245)) },
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
    'ins-005': [
        { clientEquipmentId: 'asset-008', location: 'Sala de Musculação', situation: InspectionItemStatus.Conforme, suggestedAction: 'Nenhuma' },
        { clientEquipmentId: 'asset-009', location: 'Recepção', situation: InspectionItemStatus.Conforme, suggestedAction: 'Nenhuma' },
    ],
    'ins-007': [
        { clientEquipmentId: 'asset-012', location: 'Sala de Servidores', situation: InspectionItemStatus.NaoConforme, suggestedAction: 'Substituir extintor vencido urgentemente.' },
        { clientEquipmentId: 'asset-013', location: 'Escritório', situation: InspectionItemStatus.Conforme, suggestedAction: 'Verificar bateria do alarme.' },
    ],
    'ins-008': [
        { clientEquipmentId: 'asset-014', location: 'Cozinha', situation: InspectionItemStatus.Conforme, suggestedAction: 'Nenhuma' },
    ],
};

export const MOCK_INSPECTIONS: Inspection[] = [
    { id: 'ins-001', clientId: 'cli-001', inspectedItems: MOCK_INSPECTED_ITEMS['ins-001'], date: formatDate(addDays(today, -30)), inspector: 'Carlos Pereira', observations: 'Extintor de água próximo do vencimento da recarga.', status: InspectionStatus.Pendente },
    { id: 'ins-002', clientId: 'cli-002', inspectedItems: MOCK_INSPECTED_ITEMS['ins-002'], date: formatDate(addDays(today, -10)), inspector: 'Admin', observations: 'Tudo conforme.', status: InspectionStatus.Aprovado },
    { id: 'ins-003', clientId: 'cli-003', inspectedItems: MOCK_INSPECTED_ITEMS['ins-003'], date: formatDate(addDays(today, -5)), inspector: 'Carlos Pereira', observations: 'Equipamento reprovado por baixa pressão.', status: InspectionStatus.Reprovado },
    { id: 'ins-004', clientId: 'cli-005', inspectedItems: [], date: formatDate(addDays(today, 15)), inspector: 'Admin', observations: 'Vistoria geral do condomínio agendada.', status: InspectionStatus.Agendada },
    { id: 'ins-005', clientId: 'cli-006', inspectedItems: MOCK_INSPECTED_ITEMS['ins-005'], date: formatDate(addDays(today, -50)), inspector: 'Admin', observations: 'Vistoria periódica realizada com sucesso.', status: InspectionStatus.Aprovado },
    { id: 'ins-006', clientId: 'cli-007', inspectedItems: [], date: formatDate(addDays(today, 7)), inspector: 'Carlos Pereira', observations: 'Inspeção anual programada para a próxima semana.', status: InspectionStatus.Agendada },
    { id: 'ins-007', clientId: 'cli-008', inspectedItems: MOCK_INSPECTED_ITEMS['ins-007'], date: formatDate(addDays(today, -2)), inspector: 'Admin', observations: 'Extintor da sala de servidores vencido. Necessária substituição imediata.', status: InspectionStatus.Reprovado },
    { id: 'ins-008', clientId: 'cli-010', inspectedItems: MOCK_INSPECTED_ITEMS['ins-008'], date: formatDate(addDays(today, -40)), inspector: 'Carlos Pereira', observations: 'Cliente solicitou adiantamento da vistoria. Tudo OK.', status: InspectionStatus.Pendente },
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
    { id: 'fin-006', clientId: 'cli-005', inspectionId: 'ins-004', description: 'Sinal para vistoria geral', value: 1200.00, issueDate: formatDate(addDays(today, 0)), dueDate: formatDate(addDays(today, 7)), status: PaymentStatus.Pendente },
    { 
        id: 'fin-007', clientId: 'cli-009', inspectionId: '', description: 'Pagamento condicionado', value: 2500.00, 
        issueDate: formatDate(addDays(today, -5)), dueDate: '', status: PaymentStatus.Pendente, 
        isConditionalDueDate: true, dueDateCondition: 'Após entrega do alvará de funcionamento' 
    },
    { id: 'fin-008', clientId: 'cli-007', inspectionId: '', description: 'Projeto de Segurança Contra Incêndio', value: 4500.00, issueDate: formatDate(addDays(today, -90)), dueDate: formatDate(addDays(today, -60)), status: PaymentStatus.Pendente }, // Atrasado
    { id: 'fin-009', clientId: 'cli-008', inspectionId: 'ins-007', description: 'Vistoria e consultoria de TI', value: 750.00, issueDate: formatDate(addDays(today, -2)), dueDate: formatDate(addDays(today, 28)), status: PaymentStatus.Pendente },
    { id: 'fin-010', clientId: 'cli-006', inspectionId: 'ins-005', description: 'Serviços de Manutenção Preventiva', value: 280.00, issueDate: formatDate(addDays(today, -50)), dueDate: formatDate(addDays(today, -40)), paymentDate: formatDate(addDays(today, -39)), status: PaymentStatus.Pago },
];

// --- CERTIFICATES ---
export const MOCK_CERTIFICATES: Certificate[] = [
    { id: 'cert-001', inspectionId: 'ins-002', clientId: 'cli-002', issueDate: formatDate(addDays(today, -10)), expiryDate: formatDate(addDays(today, 355)) },
    { id: 'cert-002', inspectionId: 'ins-005', clientId: 'cli-006', issueDate: formatDate(addDays(today, -50)), expiryDate: formatDate(addDays(today, 315)) },
];

// --- LICENSES ---
export const MOCK_LICENSES: License[] = [
    { id: 'lic-001', clientId: 'cli-004', type: 'Alvará de Funcionamento', issueDate: formatDate(addDays(today, -300)), expiryDate: formatDate(addDays(today, 65)), status: LicenseStatus.Pendente },
    { id: 'lic-002', clientId: 'cli-001', type: 'AVCB', issueDate: formatDate(addDays(today, -1000)), expiryDate: formatDate(addDays(today, -600)), status: LicenseStatus.Renovada },
    { id: 'lic-003', clientId: 'cli-006', type: 'AVCB', issueDate: formatDate(addDays(today, -320)), expiryDate: formatDate(addDays(today, 45)), status: LicenseStatus.Pendente },
    { id: 'lic-004', clientId: 'cli-007', type: 'Alvará de Funcionamento', issueDate: formatDate(addDays(today, -20)), expiryDate: formatDate(addDays(today, 345)), status: LicenseStatus.Renovada },
    { id: 'lic-005', clientId: 'cli-010', type: 'Licença Sanitária', issueDate: formatDate(addDays(today, -150)), expiryDate: formatDate(addDays(today, 15)), status: LicenseStatus.Pendente },
];

// --- DELIVERIES ---
export const MOCK_DELIVERIES: Delivery[] = [
    { id: 'del-001', clientId: 'cli-003', description: 'Entrega de 1 extintor PQS 4kg novo', deliveryDate: formatDate(addDays(today, 3)), status: DeliveryStatus.Pendente },
    { id: 'del-002', clientId: 'cli-001', description: 'Entrega de material de sinalização', deliveryDate: formatDate(addDays(today, -20)), status: DeliveryStatus.Entregue },
    { id: 'del-003', clientId: 'cli-008', description: 'Entrega de novo extintor CO2 para sala de servidores', deliveryDate: formatDate(addDays(today, 2)), status: DeliveryStatus.Pendente },
    { id: 'del-004', clientId: 'cli-009', description: 'Protocolo de documentação na prefeitura', deliveryDate: formatDate(addDays(today, -2)), status: DeliveryStatus.Entregue },
];

// --- EXPENSES (PAYABLES) ---
export const MOCK_EXPENSES: Expense[] = [
    { id: 'exp-001', description: 'Compra de manômetros', supplier: 'Fornecedor XYZ', value: 250.00, dueDate: formatDate(addDays(today, 12)), status: PaymentStatus.Pendente },
    { id: 'exp-002', description: 'Aluguel do escritório', value: 1500.00, dueDate: formatDate(addDays(today, -2)), status: PaymentStatus.Pago, paymentDate: formatDate(addDays(today, -2)) },
    { id: 'exp-003', description: 'Conta de Energia', supplier: 'Light', value: 450.80, dueDate: formatDate(addDays(today, -1)), status: PaymentStatus.Pendente }, // Atrasado
    { id: 'exp-004', description: 'Software de Gestão (Anual)', supplier: 'Tech Solutions', value: 1200.00, dueDate: formatDate(addDays(today, 5)), status: PaymentStatus.Pendente },
    { id: 'exp-005', description: 'Material de Escritório', supplier: 'Papelaria Central', value: 175.50, dueDate: formatDate(addDays(today, -15)), status: PaymentStatus.Pago, paymentDate: formatDate(addDays(today, -14)) },
    { id: 'exp-006', description: 'Combustível Veículo', supplier: 'Posto Shell', value: 320.00, dueDate: formatDate(addDays(today, -8)), status: PaymentStatus.Pendente }, // Atrasado
    { id: 'exp-007', description: 'Serviços de Contabilidade', supplier: 'Contábil S.A.', value: 750.00, dueDate: formatDate(addDays(today, 0)), status: PaymentStatus.Pago, paymentDate: formatDate(today) },
];
