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

export interface Client {
  id: string;
  name: string;
  document: string; // CNPJ/CPF
  address: string;
  city: string;
  contact: string;
  email: string;
}

export interface Equipment {
  id:string;
  clientId: string;
  name: string;
  serialNumber: string;
  expiryDate: string;
  type: string;
  capacity: string;
  manufacturer: string;
  lastInspectionDate?: string;
  status: InspectionStatus;
}

export interface Inspection {
  id: string;
  clientId: string;
  equipmentIds: string[];
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
  dueDate: string;
  status: PaymentStatus;
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

export type View = 'dashboard' | 'clients' | 'equipment' | 'agenda' | 'certificates' | 'financial' | 'settings' | 'clientDetail' | 'inspectionDetail' | 'certificateDetail' | 'reports';

export type User = {
    username: string; // stored as lowercase
    passwordHash: string;
    email?: string;
    fullName?: string;
    address?: string;
};

export type CompanyProfile = { 
    name: string; 
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
    inspections: Inspection[];
    financial: FinancialRecord[];
    certificates: Certificate[];
    companyProfile: CompanyProfile;
    appSettings: AppSettings;
};
