// TypeScript interfaces for database tables
// Since we're using Supabase directly, we don't need Drizzle ORM

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Appliance {
  id: string;
  user_id?: string;
  name: string;
  brand: string;
  model: string;
  purchase_date: string;
  warranty_duration_months: number;
  serial_number?: string;
  purchase_location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportContact {
  id: string;
  appliance_id: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTask {
  id: string;
  appliance_id: string;
  task_name: string;
  scheduled_date: string;
  frequency: 'One-time' | 'Monthly' | 'Yearly' | 'Custom';
  notes?: string;
  service_provider?: {
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
  };
  status: 'Upcoming' | 'Completed' | 'Overdue';
  completed_date?: string;
  created_at: string;
  updated_at: string;
}

export interface LinkedDocument {
  id: string;
  appliance_id: string;
  document_name: string;
  document_type: 'Manual' | 'Warranty' | 'Receipt' | 'Other';
  file_url: string;
  file_size?: number;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

// Database table names
export const TABLES = {
  USERS: 'users',
  APPLIANCES: 'appliances',
  SUPPORT_CONTACTS: 'support_contacts',
  MAINTENANCE_TASKS: 'maintenance_tasks',
  LINKED_DOCUMENTS: 'linked_documents',
} as const;