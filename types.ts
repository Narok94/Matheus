export enum InspectionStatus {
  Aprovado = 'Aprovado',
  Reprovado = 'Reprovado',
  Pendente = 'Pendente',
  Agendada = 'Agendada'
}

export enum PaymentStatus {
  Pago = 'Pago',
  Pendente = 'Pendente',
}

export enum DeliveryStatus {
  Pendente = 'Pendente',
  Entregue = 'Entregue',
}

export enum LicenseStatus {
  Pendente = 'Pendente',
  Renovada = 'Renovada',
}

export enum InspectionItemStatus {
  Conforme = 'Conforme',
  NaoConforme = 'Não Conforme',
}


export interface Client {
  _version?: number; // Internal field for data migration
  id: string;
  name: string;
  document: string; // CNPJ/CPF
  address: string;
  city: string;
  contactName: string;
  contact: string; // Phone
  email: string;
  isRecurring?: boolean;
  recurringAmount?: number;
  recurringInstallments?: number; // Total de parcelas
  recurringCycleStart?: string; // Data de início da cobrança
  paidInstallments?: number; // Parcelas pagas
}

// Represents a product in the catalog.
export interface Equipment {
  id:string;
  name: string;
  category: string; // Ex: 'Extintor', 'Hidrante'
  unitOfMeasure: string; // Ex: 'Unidade', 'Metro'
  costPrice?: number;
  salePrice?: number;
  observations?: string;
  capacity: string;
  manufacturer: string;
}

// Represents an instance of an Equipment owned by a client.
export interface ClientEquipment {
  id: string;
  clientId: string;
  equipmentId: string; // Foreign key to Equipment
  serialNumber: string;
  expiryDate: string;
  location: string;
  lastInspectionDate?: string;
  status: InspectionStatus;
}


export interface InspectedItem {
  clientEquipmentId: string; // Changed from equipmentId
  location: string;
  situation: InspectionItemStatus;
  suggestedAction: string;
}

export interface Inspection {
  id: string;
  clientId: string;
  inspectedItems: InspectedItem[];
  date: string;
  inspector: string;
  observations: string;
  clientSignature?: string; // a base64 string or url
  status: InspectionStatus;
}

export interface Certificate {
  id: string;
  inspectionId: string;
  clientId: string;
  issueDate: string;
  expiryDate: string;
}

export interface FinancialRecord {
  id: string;
  clientId: string;
  inspectionId: string;
  description: string;
  value: number;
  issueDate: string;
  dueDate: string; // Will be empty string if conditional
  paymentDate?: string;
  status: PaymentStatus;
  isConditionalDueDate?: boolean;
  dueDateCondition?: string;
}

export interface License {
  id: string;
  clientId: string;
  type: string;
  issueDate: string;
  expiryDate: string;
  status: LicenseStatus;
}

export interface Delivery {
  id: string;
  clientId: string;
  description: string;
  deliveryDate: string;
  status: DeliveryStatus;
}

export interface Expense { // For "Contas a Pagar"
  id: string;
  description: string;
  supplier?: string;
  document?: string; // CPF/CNPJ
  pixKey?: string;
  value: number;
  dueDate: string; // Will be empty string if conditional
  paymentDate?: string;
  status: PaymentStatus;
  isConditionalDueDate?: boolean;
  dueDateCondition?: string;
  recurringPayableId?: string; // Link to the master recurring payable
}

export interface RecurringPayable {
  id: string;
  description: string;
  supplier?: string;
  document?: string;
  pixKey?: string;
  value: number; // The recurring amount
  recurringInstallments: number;
  recurringCycleStart: string;
  paidInstallments: number;
}

export type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error';
} | null;

export type DetailView = {
    type: 'client' | 'inspection' | 'certificate';
    id: string;
} | null;

export type View = 'dashboard' | 'clients' | 'equipment' | 'agenda' | 'certificates' | 'financial' | 'settings' | 'clientDetail' | 'inspectionDetail' | 'certificateDetail' | 'reports' | 'payables';

export type User = {
    username: string; // stored as lowercase
    passwordHash: string;
    email?: string;
    fullName?: string;
};

export type CompanyProfile = { 
    name: string; 
    logo?: string; // Base64 encoded image
};

export type AppSettings = { 
    reminders: boolean; 
};

export type PrefilledInspectionData = {
    clientId?: string;
} | null;

export type BackupData = {
    clients: Client[];
    equipment: Equipment[];
    clientEquipment: ClientEquipment[];
    inspections: Inspection[];
    financial: FinancialRecord[];
    certificates: Certificate[];
    licenses: License[];
    deliveries: Delivery[];
    expenses: Expense[];
    recurringPayables: RecurringPayable[];
    companyProfile: CompanyProfile;
    appSettings: AppSettings;
};