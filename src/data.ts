
import { Client, Equipment, Inspection, FinancialRecord, Certificate, InspectionStatus, PaymentStatus } from './types';

export const MOCK_CLIENTS: Client[] = [
  { id: 'cli-1', name: 'Construtora Alfa', document: '11.222.333/0001-44', address: 'Rua das Obras, 123', city: 'São Paulo', contact: '(11) 98765-4321', email: 'contato@alfa.com' },
  { id: 'cli-2', name: 'Shopping Center Plaza', document: '22.333.444/0001-55', address: 'Av. Principal, 500', city: 'Rio de Janeiro', contact: '(21) 91234-5678', email: 'seguranca@plaza.com' },
  { id: 'cli-3', name: 'Indústria Têxtil Fios Finos', document: '33.444.555/0001-66', address: 'Rodovia dos Tecidos, km 10', city: 'Blumenau', contact: '(47) 95555-1234', email: 'admin@fiosfinos.com.br' },
];

export const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq-1', clientId: 'cli-1', name: 'Extintor ABC', serialNumber: 'SN-ABC-001', expiryDate: '2025-10-15', type: 'Pó Químico', capacity: '6kg', manufacturer: 'FireStop', lastInspectionDate: '2024-10-15', status: InspectionStatus.Aprovado },
  { id: 'eq-2', clientId: 'cli-1', name: 'Hidrante de Parede', serialNumber: 'SN-HID-001', expiryDate: '2028-01-20', type: 'Tipo 2', capacity: '2.5"', manufacturer: 'WaterFlow', lastInspectionDate: '2024-01-20', status: InspectionStatus.Aprovado },
  { id: 'eq-3', clientId: 'cli-2', name: 'Extintor CO2', serialNumber: 'SN-CO2-005', expiryDate: '2024-08-30', type: 'Dióxido de Carbono', capacity: '10kg', manufacturer: 'FireStop', lastInspectionDate: '2023-08-30', status: InspectionStatus.Reprovado },
  { id: 'eq-4', clientId: 'cli-2', name: 'Mangueira de Incêndio', serialNumber: 'SN-MAN-010', expiryDate: '2026-05-01', type: 'Tipo 1', capacity: '15m', manufacturer: 'WaterFlow', lastInspectionDate: '2024-05-01', status: InspectionStatus.Pendente },
  { id: 'eq-5', clientId: 'cli-3', name: 'Extintor Água', serialNumber: 'SN-H2O-002', expiryDate: '2025-12-01', type: 'Água Pressurizada', capacity: '10L', manufacturer: 'SafeGuard', status: InspectionStatus.Agendada },
];

export const MOCK_INSPECTIONS: Inspection[] = [
  { id: 'ins-1', clientId: 'cli-1', equipmentIds: ['eq-1', 'eq-2'], date: '2024-10-15', inspector: 'João Silva', observations: 'Todos os itens em conformidade.', status: InspectionStatus.Aprovado },
  { id: 'ins-2', clientId: 'cli-2', equipmentIds: ['eq-3'], date: '2024-08-30', inspector: 'João Silva', observations: 'Válvula do extintor com vazamento. Reprovado.', status: InspectionStatus.Reprovado },
  { id: 'ins-3', clientId: 'cli-2', equipmentIds: ['eq-4'], date: '2024-09-01', inspector: 'Maria Souza', observations: 'Teste hidrostático pendente de resultado.', status: InspectionStatus.Pendente },
  { id: 'ins-4', clientId: 'cli-3', equipmentIds: ['eq-5'], date: '2024-12-01', inspector: 'João Silva', observations: 'Inspeção agendada.', status: InspectionStatus.Agendada },
];

export const MOCK_CERTIFICATES: Certificate[] = [
    { id: 'cert-1', inspectionId: 'ins-1', clientId: 'cli-1', issueDate: '2024-10-15', expiryDate: '2025-10-15' },
];

export const MOCK_FINANCIAL: FinancialRecord[] = [
  { id: 'fin-1', clientId: 'cli-1', inspectionId: 'ins-1', description: 'Serviço de Inspeção Anual', value: 350.00, issueDate: '2024-10-15', dueDate: '2024-11-15', status: PaymentStatus.Pago },
  { id: 'fin-2', clientId: 'cli-2', inspectionId: 'ins-2', description: 'Serviço de Inspeção e Recarga', value: 150.00, issueDate: '2024-08-30', dueDate: '2024-09-30', status: PaymentStatus.Pendente },
  { id: 'fin-3', clientId: 'cli-2', inspectionId: 'ins-3', description: 'Teste Hidrostático', value: 250.00, issueDate: '2024-09-01', dueDate: '2024-10-01', status: PaymentStatus.Pendente },
];