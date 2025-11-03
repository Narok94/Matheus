
import { Client, Equipment, Inspection, FinancialRecord, Certificate, InspectionStatus, PaymentStatus, License, Delivery, Expense, DeliveryStatus, LicenseStatus, InspectedItem, InspectionItemStatus } from './types';

export const MOCK_CLIENTS: Client[] = [
  { id: 'cli-1', name: 'Construtora Alfa', document: '11.222.333/0001-44', address: 'Rua das Obras, 123', city: 'São Paulo', contactName: 'Sr. Roberto', contact: '(11) 98765-4321', email: 'contato@alfa.com' },
  { id: 'cli-2', name: 'Shopping Center Plaza', document: '22.333.444/0001-55', address: 'Av. Principal, 500', city: 'Rio de Janeiro', contactName: 'Sra. Marcia', contact: '(21) 91234-5678', email: 'seguranca@plaza.com' },
  { id: 'cli-3', name: 'Indústria Têxtil Fios Finos', document: '33.444.555/0001-66', address: 'Rodovia dos Tecidos, km 10', city: 'Blumenau', contactName: 'Carlos', contact: '(47) 95555-1234', email: 'admin@fiosfinos.com.br' },
];

export const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq-1', clientId: 'cli-1', name: 'Extintor ABC', serialNumber: 'SN-ABC-001', expiryDate: '2025-10-15', category: 'Extintor', unitOfMeasure: 'Unidade', costPrice: 50.00, salePrice: 90.00, observations: 'Manter em local seco.', capacity: '6kg', manufacturer: 'FireStop', lastInspectionDate: '2024-10-15', status: InspectionStatus.Aprovado },
  { id: 'eq-2', clientId: 'cli-1', name: 'Hidrante de Parede', serialNumber: 'SN-HID-001', expiryDate: '2028-01-20', category: 'Hidrante', unitOfMeasure: 'Unidade', salePrice: 500.00, capacity: '2.5"', manufacturer: 'WaterFlow', lastInspectionDate: '2024-01-20', status: InspectionStatus.Aprovado },
  { id: 'eq-3', clientId: 'cli-2', name: 'Extintor CO2', serialNumber: 'SN-CO2-005', expiryDate: '2024-08-30', category: 'Extintor', unitOfMeasure: 'Unidade', salePrice: 150.00, capacity: '10kg', manufacturer: 'FireStop', lastInspectionDate: '2023-08-30', status: InspectionStatus.Reprovado },
  { id: 'eq-4', clientId: 'cli-2', name: 'Mangueira de Incêndio', serialNumber: 'SN-MAN-010', expiryDate: '2026-05-01', category: 'Hidrante', unitOfMeasure: 'Metro', salePrice: 200.00, capacity: '15m', manufacturer: 'WaterFlow', lastInspectionDate: '2024-05-01', status: InspectionStatus.Pendente },
  { id: 'eq-5', clientId: 'cli-3', name: 'Extintor Água', serialNumber: 'SN-H2O-002', expiryDate: '2025-12-01', category: 'Extintor', unitOfMeasure: 'Unidade', salePrice: 80.00, capacity: '10L', manufacturer: 'SafeGuard', status: InspectionStatus.Agendada },
  { id: 'eq-6', clientId: 'cli-2', name: 'Extintor CO2 Corredor', serialNumber: 'SN-CO2-011', expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0], category: 'Extintor', unitOfMeasure: 'Unidade', salePrice: 150.00, capacity: '10kg', manufacturer: 'FireStop', status: InspectionStatus.Aprovado },
  { id: 'eq-7', clientId: 'cli-3', name: 'Mangueira de Incêndio T2', serialNumber: 'SN-MAN-012', expiryDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString().split('T')[0], category: 'Hidrante', unitOfMeasure: 'Metro', salePrice: 250.00, capacity: '30m', manufacturer: 'WaterFlow', status: InspectionStatus.Aprovado },
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

export const MOCK_INSPECTIONS: Inspection[] = [
  { id: 'ins-1', clientId: 'cli-1', inspectedItems: MOCK_INSPECTED_ITEMS_1, date: '2024-10-15', inspector: 'João Silva', observations: 'Todos os itens em conformidade.', status: InspectionStatus.Aprovado },
  { id: 'ins-2', clientId: 'cli-2', inspectedItems: MOCK_INSPECTED_ITEMS_2, date: '2024-08-30', inspector: 'João Silva', observations: 'Válvula do extintor com vazamento. Reprovado.', status: InspectionStatus.Reprovado },
  { id: 'ins-3', clientId: 'cli-2', inspectedItems: MOCK_INSPECTED_ITEMS_3, date: '2024-09-01', inspector: 'Maria Souza', observations: 'Teste hidrostático pendente de resultado.', status: InspectionStatus.Pendente },
  { id: 'ins-4', clientId: 'cli-3', inspectedItems: [{ equipmentId: 'eq-5', location: 'Galpão de Tecidos', situation: InspectionItemStatus.Conforme, suggestedAction: 'N/A' }], date: '2024-12-01', inspector: 'João Silva', observations: 'Inspeção agendada.', status: InspectionStatus.Agendada },
];

export const MOCK_CERTIFICATES: Certificate[] = [
    { id: 'cert-1', inspectionId: 'ins-1', clientId: 'cli-1', issueDate: '2024-10-15', expiryDate: '2025-10-15' },
];

export const MOCK_FINANCIAL: FinancialRecord[] = [
  { id: 'fin-1', clientId: 'cli-1', inspectionId: 'ins-1', description: 'Serviço de Inspeção Anual', value: 350.00, issueDate: '2024-10-15', dueDate: '2024-11-15', paymentDate: '2024-11-10', status: PaymentStatus.Pago },
  { id: 'fin-2', clientId: 'cli-2', inspectionId: 'ins-2', description: 'Serviço de Inspeção e Recarga', value: 150.00, issueDate: '2024-08-30', dueDate: '2024-09-30', status: PaymentStatus.Pendente },
  { id: 'fin-3', clientId: 'cli-2', inspectionId: 'ins-3', description: 'Teste Hidrostático', value: 250.00, issueDate: '2024-09-01', dueDate: '2024-10-01', status: PaymentStatus.Pendente },
];

export const MOCK_LICENSES: License[] = [
  { id: 'lic-1', clientId: 'cli-1', type: 'Licença de Bombeiro', issueDate: '2024-01-10', expiryDate: '2025-01-10', status: LicenseStatus.Pendente },
  { id: 'lic-2', clientId: 'cli-2', type: 'Alvará de Funcionamento', issueDate: '2023-07-20', expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], status: LicenseStatus.Pendente }, // Expires in 30 days
];

export const MOCK_DELIVERIES: Delivery[] = [
  { id: 'del-1', clientId: 'cli-1', description: 'Entrega de 10 extintores ABC', deliveryDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], status: DeliveryStatus.Pendente },
  { id: 'del-2', clientId: 'cli-3', description: 'Manutenção de hidrante', deliveryDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0], status: DeliveryStatus.Pendente },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'exp-1', description: 'Aluguel do escritório', supplier: 'Imobiliária Central', value: 1500.00, dueDate: '2024-09-05', status: PaymentStatus.Pendente },
  { id: 'exp-2', description: 'Conta de luz', supplier: 'Companhia Elétrica', value: 250.75, dueDate: '2024-08-20', paymentDate: '2024-08-18', status: PaymentStatus.Pago },
];