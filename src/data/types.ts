// ==================== Types ====================

export interface SocialMedia {
  linkedin?: string;
  instagram?: string;
  whatsapp?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Employee {
  id: string;
  fullName: string;
  photoUrl?: string;
  
  cpf: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  socialMedia: SocialMedia;
  bloodType: string;
  gender?: string;
  birthDate?: string;
  preExistingConditions: string[];
  medications: string[];
  allergies: string[];
  emergencyContact: EmergencyContact;
}

export interface Wristband {
  id: string;
  code: string;
  employeeId: string;
}

export type ShiftType = "Manhã" | "Tarde" | "Noite";

export interface WorkSchedule {
  id: string;
  employeeId: string;
  date: string; // ISO date string YYYY-MM-DD
  shift: ShiftType;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export type ClockEventType = "entrada" | "saída" | "saída-almoço" | "retorno-almoço";

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ClockRecord {
  id: string;
  employeeId: string;
  dateTime: string; // ISO datetime
  type: ClockEventType;
  location?: GeoLocation;
  edited: boolean;
}

export interface Notification {
  id: string;
  employeeId: string | null; // null = broadcast
  title: string;
  message: string;
  dateTime: string; // ISO datetime
  read: boolean;
  imageUrl?: string;
}

// ==================== DB Row → Domain mappers ====================

export function mapEmployee(row: any): Employee {
  return {
    id: row.id,
    fullName: row.full_name,
    photoUrl: row.photo_url ?? undefined,
    
    cpf: row.cpf,
    role: row.role,
    department: row.department,
    phone: row.phone,
    email: row.email,
    socialMedia: {
      linkedin: row.linkedin ?? undefined,
      instagram: row.instagram ?? undefined,
      whatsapp: row.whatsapp ?? undefined,
    },
    bloodType: row.blood_type,
    gender: row.gender ?? undefined,
    birthDate: row.birth_date ?? undefined,
    preExistingConditions: row.pre_existing_conditions ?? [],
    medications: row.medications ?? [],
    allergies: row.allergies ?? [],
    emergencyContact: {
      name: row.emergency_contact_name,
      phone: row.emergency_contact_phone,
      relationship: row.emergency_contact_relationship,
    },
  };
}

export function mapWristband(row: any): Wristband {
  return {
    id: row.id,
    code: row.code,
    employeeId: row.employee_id,
  };
}

export function mapWorkSchedule(row: any): WorkSchedule {
  return {
    id: row.id,
    employeeId: row.employee_id,
    date: row.date,
    shift: row.shift as ShiftType,
    startTime: row.start_time?.slice(0, 5) ?? "",
    endTime: row.end_time?.slice(0, 5) ?? "",
  };
}

export function mapClockRecord(row: any): ClockRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    dateTime: row.date_time,
    type: row.type as ClockEventType,
    location:
      row.latitude != null && row.longitude != null
        ? { latitude: row.latitude, longitude: row.longitude, accuracy: row.accuracy ?? undefined }
        : undefined,
    edited: row.edited ?? false,
  };
}

export function mapNotification(row: any): Notification {
  return {
    id: row.id,
    employeeId: row.employee_id ?? null,
    title: row.title,
    message: row.message,
    dateTime: row.date_time,
    read: row.read,
    imageUrl: row.image_url ?? undefined,
  };
}
