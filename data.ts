

import { Client, Equipment, Inspection, FinancialRecord, Certificate, InspectionStatus, PaymentStatus, License, Delivery, Expense, DeliveryStatus, LicenseStatus, InspectedItem, InspectionItemStatus } from './types';

export const MOCK_CLIENTS: Client[] = [
  { id: 'cli-1', name: 'Construtora Alfa', document: '11.222.333/0001-44', address: 'Rua das Obras, 123', city: 'São Paulo', contactName: 'Sr. Roberto', contact: '(11) 98765-4321', email: 'contato@alfa.com', isRecurring: true, recurringAmount: 500, recurringInstallments: 12, recurringCycleStart: '2024-08-01', paidInstallments: 1 },
  { id: 'cli-2', name: 'Shopping Center Plaza', document: '22.333.444/0001-55', address: 'Av. Principal, 500', city: 'Rio de Janeiro', contactName: 'Sra. Marcia', contact: '(21) 91234-5678', email: 'seguranca@plaza.com' },
  { id: 'cli-3', name: 'Indústria Têxtil Fios Finos', document: '33.444.555/0001-66', address: 'Rodovia dos Tecidos, km 10', city: 'Blumenau', contactName: 'Carlos', contact: '(47) 95555-1234', email: 'admin@fiosfinos.com.br', isRecurring: true, recurringAmount: 350, recurringInstallments: 6, recurringCycleStart: '2024-07-15', paidInstallments: 2 },
  { id: 'cli-4', name: 'Hotel Beira Mar', document: '44.555.666/0001-77', address: 'Avenida Atlântica, 1000', city: 'Fortaleza', contactName: 'Gerente Ana', contact: '(85) 94444-3333', email: 'gerencia@beiramar.com' },
  { id: 'cli-5', name: 'Escola Aprender Mais', document: '55.666.777/0001-88', address: 'Rua do Saber, 456', city: 'Curitiba', contactName: 'Diretora Lúcia', contact: '(41) 96666-7777', email: 'diretoria@aprendermais.edu.br' },
];

export const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq-1', clientId: 'cli-1', name: 'Extintor ABC', serialNumber: 'SN-ABC-001', expiryDate: '2025-10-15', category: 'Extintor', unitOfMeasure: 'Unidade', costPrice: 50.00, salePrice: 90.00, observations: 'Manter em local seco.', capacity: '6kg', manufacturer: 'FireStop', lastInspectionDate: '2024-10-15', status: InspectionStatus.Aprovado },
  { id: 'eq-2', clientId: 'cli-1', name: 'Hidrante de Parede', serialNumber: 'SN-HID-001', expiryDate: '2028-01-20', category: 'Hidrante', unitOfMeasure: 'Unidade', salePrice: 500.00, capacity: '2.5"', manufacturer: 'WaterFlow', lastInspectionDate: '2024-01-20', status: InspectionStatus.Aprovado },
  { id: 'eq-3', clientId: 'cli-2', name: 'Extintor CO2', serialNumber: 'SN-CO2-005', expiryDate: '2024-08-30', category: 'Extintor', unitOfMeasure: 'Unidade', salePrice: 150.00, capacity: '10kg', manufacturer: 'FireStop', lastInspectionDate: '2023-08-30', status: InspectionStatus.Reprovado },
  { id: 'eq-4', clientId: 'cli-2', name: 'Mangueira de Incêndio', serialNumber: 'SN-MAN-010', expiryDate: '2026-05-01', category: 'Hidrante', unitOfMeasure: 'Metro', salePrice: 200.00, capacity: '15m', manufacturer: 'WaterFlow', lastInspectionDate: '2024-05-01', status: InspectionStatus.Pendente },
  { id: 'eq-5', clientId: 'cli-3', name: 'Extintor Água', serialNumber: 'SN-H2O-002', expiryDate: '2025-12-01', category: 'Extintor', unitOfMeasure: 'Unidade', salePrice: 80.00, capacity: '10L', manufacturer: 'SafeGuard', status: InspectionStatus.Agendada },
  { id: 'eq-6', clientId: 'cli-2', name: 'Extintor CO2 Corredor', serialNumber: 'SN-CO2-011', expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0], category: 'Extintor', unitOfMeasure: 'Unidade', salePrice: 150.00, capacity: '10kg', manufacturer: 'FireStop', status: InspectionStatus.Aprovado },
  { id: 'eq-7', clientId: 'cli-3', name: 'Mangueira de Incêndio T2', serialNumber: 'SN-MAN-012', expiryDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString().split('T')[0], category: 'Hidrante', unitOfMeasure: 'Metro', salePrice: 250.00, capacity: '30m', manufacturer: 'WaterFlow', status: InspectionStatus.Aprovado },
  { id: 'eq-8', clientId: 'cli-4', name: 'Extintor ABC - Lobby', serialNumber: 'SN-ABC-101', expiryDate: '2026-03-22', category: 'Extintor', unitOfMeasure: 'Unidade', salePrice: 95.00, capacity: '6kg', manufacturer: 'FireStop', lastInspectionDate: '2025-03-22', status: InspectionStatus.Aprovado },
  { id: 'eq-9', clientId: 'cli-5', name: 'Alarme de Incêndio Central', serialNumber: 'SN-ALM-001', expiryDate: '2029-01-01', category: 'Alarme', unitOfMeasure: 'Unidade', salePrice: 1200.00, capacity: '12 zonas', manufacturer: 'AlertMax', status: InspectionStatus.Aprovado },
  { id: 'eq-10', clientId: 'cli-4', name: 'Sinalização de Saída', serialNumber: 'N/A', expiryDate: '2030-01-01', category: 'Sinalização', unitOfMeasure: 'Kit', salePrice: 300.00, capacity: '10 placas', manufacturer: 'SafeGuard', status: InspectionStatus.Aprovado },
];

const MOCK_INSPECTED_ITEMS_1: InspectedItem[] = [
  { equipmentId: 'eq-1', location: 'Térreo - Recepção', situation: InspectionItemStatus.Conforme, suggestedAction: 'Nenhuma' },
  { equipmentId: 'eq-2', location: '1º Andar - Corredor A', situation: InspectionItemStatus.Conforme, suggestedAction: 'Nenhuma' },
];

const MOCK_INSPECTED_ITEMS_2: InspectedItem[] = [
  { equipmentId: 'eq-3', location: 'Estacionamento G1', situation: InspectionItemStatus.NaoConforme, suggestedAction: 'Troca da válvula' },
];

const MOCK_INSPECTED_ITEMS_3: InspectedItem[] = [
    { equipmentId: 'eq-4', location: 'Área da praça de alimentação', situation: InspectionItemStatus.Conforme, suggestedAction: 'Realizar teste hidrostático' },
];

const MOCK_INSPECTED_ITEMS_4: InspectedItem[] = [
    { equipmentId: 'eq-8', location: 'Recepção', situation: InspectionItemStatus.Conforme, suggestedAction: 'Nenhuma' },
    { equipmentId: 'eq-10', location: 'Corredores', situation: InspectionItemStatus.Conforme, suggestedAction: 'Verificar baterias' },
];

export const MOCK_INSPECTIONS: Inspection[] = [
  { id: 'ins-1', clientId: 'cli-1', inspectedItems: MOCK_INSPECTED_ITEMS_1, date: '2024-10-15', inspector: 'João Silva', observations: 'Todos os itens em conformidade.', status: InspectionStatus.Aprovado },
  { id: 'ins-2', clientId: 'cli-2', inspectedItems: MOCK_INSPECTED_ITEMS_2, date: '2024-08-30', inspector: 'João Silva', observations: 'Válvula do extintor com vazamento. Reprovado.', status: InspectionStatus.Reprovado },
  { id: 'ins-3', clientId: 'cli-2', inspectedItems: MOCK_INSPECTED_ITEMS_3, date: '2024-09-01', inspector: 'Maria Souza', observations: 'Teste hidrostático pendente de resultado.', status: InspectionStatus.Pendente },
  { id: 'ins-4', clientId: 'cli-3', inspectedItems: [{ equipmentId: 'eq-5', location: 'Galpão de Tecidos', situation: InspectionItemStatus.Conforme, suggestedAction: 'N/A' }], date: '2024-12-01', inspector: 'João Silva', observations: 'Inspeção agendada.', status: InspectionStatus.Agendada },
  { id: 'ins-5', clientId: 'cli-4', inspectedItems: MOCK_INSPECTED_ITEMS_4, date: '2025-03-22', inspector: 'Maria Souza', observations: 'Tudo OK.', status: InspectionStatus.Aprovado },
  { id: 'ins-6', clientId: 'cli-5', inspectedItems: [{ equipmentId: 'eq-9', location: 'Secretaria', situation: InspectionItemStatus.Conforme, suggestedAction: 'N/A' }], date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], inspector: 'João Silva', observations: 'Agendado para a próxima semana.', status: InspectionStatus.Agendada },
];

export const MOCK_CERTIFICATES: Certificate[] = [
    { id: 'cert-1', inspectionId: 'ins-1', clientId: 'cli-1', issueDate: '2024-10-15', expiryDate: '2025-10-15' },
    { id: 'cert-2', inspectionId: 'ins-5', clientId: 'cli-4', issueDate: '2025-03-22', expiryDate: '2026-03-22' },
];

export const MOCK_FINANCIAL: FinancialRecord[] = [
  { id: 'fin-1', clientId: 'cli-1', inspectionId: 'ins-1', description: 'Serviço de Inspeção Anual', value: 350.00, issueDate: '2024-10-15', dueDate: '2024-11-15', paymentDate: '2024-11-10', status: PaymentStatus.Pago },
  { id: 'fin-2', clientId: 'cli-2', inspectionId: 'ins-2', description: 'Serviço de Inspeção e Recarga', value: 150.00, issueDate: '2024-08-30', dueDate: '2024-09-30', status: PaymentStatus.Pendente },
  { id: 'fin-3', clientId: 'cli-2', inspectionId: 'ins-3', description: 'Teste Hidrostático', value: 250.00, issueDate: '2024-09-01', dueDate: '2024-10-01', status: PaymentStatus.Pendente },
  { id: 'fin-4', clientId: 'cli-4', inspectionId: 'ins-5', description: 'Inspeção e Laudo Hotel', value: 850.00, issueDate: '2025-03-22', dueDate: '2025-04-22', status: PaymentStatus.Pendente },
  { id: 'fin-5', clientId: 'cli-5', inspectionId: 'ins-6', description: 'Inspeção Agendada Escola', value: 600.00, issueDate: new Date().toISOString().split('T')[0], dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], status: PaymentStatus.Pendente },
];

export const MOCK_LICENSES: License[] = [
  { id: 'lic-1', clientId: 'cli-1', type: 'Licença de Bombeiro', issueDate: '2024-01-10', expiryDate: '2025-01-10', status: LicenseStatus.Pendente },
  { id: 'lic-2', clientId: 'cli-2', type: 'Alvará de Funcionamento', issueDate: '2023-07-20', expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], status: LicenseStatus.Pendente }, // Expires in 30 days
  { id: 'lic-3', clientId: 'cli-5', type: 'Licença Sanitária', issueDate: '2024-02-15', expiryDate: '2025-02-15', status: LicenseStatus.Pendente },
];

export const MOCK_DELIVERIES: Delivery[] = [
  { id: 'del-1', clientId: 'cli-1', description: 'Entrega de 10 extintores ABC', deliveryDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], status: DeliveryStatus.Pendente },
  { id: 'del-2', clientId: 'cli-3', description: 'Manutenção de hidrante', deliveryDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0], status: DeliveryStatus.Pendente },
  { id: 'del-3', clientId: 'cli-4', description: 'Entrega de 5 placas de sinalização', deliveryDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0], status: DeliveryStatus.Pendente },
  { id: 'del-4', clientId: 'cli-2', description: 'Substituição de mangueiras (30m)', deliveryDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0], status: DeliveryStatus.Pendente },
  { id: 'del-5', clientId: 'cli-5', description: 'Recarga de 3 extintores CO2', deliveryDate: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString().split('T')[0], status: DeliveryStatus.Pendente },
  { id: 'del-6', clientId: 'cli-1', description: 'Kit de primeiros socorros', deliveryDate: '2024-07-20', status: DeliveryStatus.Entregue },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'exp-1', description: 'Aluguel do escritório', supplier: 'Imobiliária Central', value: 1500.00, dueDate: '2024-09-05', status: PaymentStatus.Pendente },
  { id: 'exp-2', description: 'Conta de luz', supplier: 'Companhia Elétrica', value: 250.75, dueDate: '2024-08-20', paymentDate: '2024-08-18', status: PaymentStatus.Pago },
  { id: 'exp-3', description: 'Compra de material de escritório', supplier: 'Papelaria ABC', value: 120.50, dueDate: '2024-09-10', status: PaymentStatus.Pendente },
  { id: 'exp-4', description: 'Software de Gestão (Mensalidade)', supplier: 'Tech Solutions', value: 99.90, dueDate: '2024-09-01', paymentDate: '2024-09-01', status: PaymentStatus.Pago },
];