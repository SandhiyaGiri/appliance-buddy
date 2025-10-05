export type WarrantyStatus = 'Active' | 'Expiring Soon' | 'Expired';

export interface SupportContact {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
}

export interface MaintenanceTask {
  id: string;
  applianceId: string;
  taskName: string;
  scheduledDate: string;
  frequency: 'One-time' | 'Monthly' | 'Yearly' | 'Custom';
  serviceProvider?: {
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
  };
  notes?: string;
  status: 'Upcoming' | 'Completed' | 'Overdue';
  completedDate?: string;
}

export interface LinkedDocument {
  id: string;
  title: string;
  url: string;
}

export interface Appliance {
  id: string;
  name: string;
  brand: string;
  model: string;
  purchaseDate: string;
  warrantyDurationMonths: number;
  serialNumber?: string;
  purchaseLocation?: string;
  notes?: string;
  supportContacts: SupportContact[];
  maintenanceTasks: MaintenanceTask[];
  linkedDocuments: LinkedDocument[];
}

export type AppliancePayload = Omit<Appliance, 'id' | 'supportContacts' | 'maintenanceTasks' | 'linkedDocuments'>;
