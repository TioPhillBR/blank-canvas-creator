import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  mapEmployee,
  mapWristband,
  mapWorkSchedule,
  mapClockRecord,
  mapNotification,
} from "@/data/types";
import type {
  Employee,
  Wristband,
  WorkSchedule,
  ClockRecord,
  ClockEventType,
  GeoLocation,
  Notification,
} from "@/data/types";

export function useSupabaseDatabase() {
  // ---- Employees ----
  const fetchEmployees = useCallback(async (): Promise<Employee[]> => {
    const { data, error } = await supabase.from("employees").select("*").order("full_name");
    if (error) throw error;
    return (data ?? []).map(mapEmployee);
  }, []);

  const fetchEmployeeById = useCallback(async (id: string): Promise<Employee | null> => {
    const { data, error } = await supabase.from("employees").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapEmployee(data) : null;
  }, []);

  const insertEmployee = useCallback(async (emp: Omit<Employee, "id">): Promise<Employee> => {
    const { data, error } = await supabase
      .from("employees")
      .insert({
        full_name: emp.fullName,
        photo_url: emp.photoUrl ?? null,
        
        cpf: emp.cpf,
        role: emp.role,
        department: emp.department,
        phone: emp.phone,
        email: emp.email,
        linkedin: emp.socialMedia?.linkedin ?? null,
        instagram: emp.socialMedia?.instagram ?? null,
        blood_type: emp.bloodType,
        pre_existing_conditions: emp.preExistingConditions ?? [],
        medications: emp.medications ?? [],
        allergies: emp.allergies ?? [],
        emergency_contact_name: emp.emergencyContact.name,
        emergency_contact_phone: emp.emergencyContact.phone,
        emergency_contact_relationship: emp.emergencyContact.relationship,
      })
      .select()
      .single();
    if (error) throw error;
    return mapEmployee(data);
  }, []);

  const updateEmployee = useCallback(async (id: string, emp: Partial<Employee>): Promise<Employee> => {
    const updates: Record<string, unknown> = {};
    if (emp.fullName !== undefined) updates.full_name = emp.fullName;
    if (emp.photoUrl !== undefined) updates.photo_url = emp.photoUrl ?? null;
    
    if (emp.cpf !== undefined) updates.cpf = emp.cpf;
    if (emp.role !== undefined) updates.role = emp.role;
    if (emp.department !== undefined) updates.department = emp.department;
    if (emp.phone !== undefined) updates.phone = emp.phone;
    if (emp.email !== undefined) updates.email = emp.email;
    if (emp.socialMedia?.linkedin !== undefined) updates.linkedin = emp.socialMedia.linkedin;
    if (emp.socialMedia?.instagram !== undefined) updates.instagram = emp.socialMedia.instagram;
    if (emp.bloodType !== undefined) updates.blood_type = emp.bloodType;
    if (emp.preExistingConditions !== undefined) updates.pre_existing_conditions = emp.preExistingConditions;
    if (emp.medications !== undefined) updates.medications = emp.medications;
    if (emp.allergies !== undefined) updates.allergies = emp.allergies;
    if (emp.emergencyContact !== undefined) {
      updates.emergency_contact_name = emp.emergencyContact.name;
      updates.emergency_contact_phone = emp.emergencyContact.phone;
      updates.emergency_contact_relationship = emp.emergencyContact.relationship;
    }
    const { data, error } = await supabase
      .from("employees")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapEmployee(data);
  }, []);

  const deleteEmployee = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) throw error;
  }, []);

  // ---- Wristbands ----
  const fetchWristbands = useCallback(async (): Promise<Wristband[]> => {
    const { data, error } = await supabase.from("wristbands").select("*");
    if (error) throw error;
    return (data ?? []).map(mapWristband);
  }, []);

  const fetchEmployeeByWristbandCode = useCallback(async (code: string): Promise<Employee | null> => {
    const { data: wb, error: wbErr } = await supabase
      .from("wristbands")
      .select("employee_id")
      .eq("code", code)
      .maybeSingle();
    if (wbErr || !wb) return null;
    return fetchEmployeeById(wb.employee_id);
  }, [fetchEmployeeById]);

  // ---- Schedules ----
  const fetchSchedulesByEmployee = useCallback(async (employeeId: string): Promise<WorkSchedule[]> => {
    const { data, error } = await supabase
      .from("work_schedules")
      .select("*")
      .eq("employee_id", employeeId)
      .order("date");
    if (error) throw error;
    return (data ?? []).map(mapWorkSchedule);
  }, []);

  // ---- Clock Records ----
  const fetchClockRecordsByEmployee = useCallback(async (employeeId: string): Promise<ClockRecord[]> => {
    const { data, error } = await supabase
      .from("clock_records")
      .select("*")
      .eq("employee_id", employeeId)
      .order("date_time", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapClockRecord);
  }, []);

  const insertClockRecord = useCallback(async (
    employeeId: string,
    type: ClockEventType,
    location?: GeoLocation
  ): Promise<ClockRecord> => {
    const { data, error } = await supabase
      .from("clock_records")
      .insert({
        employee_id: employeeId,
        type,
        date_time: new Date().toISOString(),
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        accuracy: location?.accuracy ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapClockRecord(data);
  }, []);

  // ---- Notifications ----
  const fetchNotificationsByEmployee = useCallback(async (employeeId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`employee_id.is.null,employee_id.eq.${employeeId}`)
      .eq("archived", false)
      .order("date_time", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapNotification);
  }, []);

  const fetchAllNotifications = useCallback(async (): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("date_time", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapNotification);
  }, []);

  const insertNotification = useCallback(async (
    employeeId: string | null,
    title: string,
    message: string
  ): Promise<Notification> => {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        employee_id: employeeId,
        title,
        message,
        date_time: new Date().toISOString(),
        read: false,
      })
      .select()
      .single();
    if (error) throw error;
    return mapNotification(data);
  }, []);

  const markNotificationRead = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    if (error) throw error;
  }, []);

  const archiveNotification = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("notifications")
      .update({ archived: true })
      .eq("id", id);
    if (error) throw error;
  }, []);

  const deleteNotification = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }, []);

  return {
    fetchEmployees,
    fetchEmployeeById,
    insertEmployee,
    updateEmployee,
    deleteEmployee,
    fetchWristbands,
    fetchEmployeeByWristbandCode,
    fetchSchedulesByEmployee,
    fetchClockRecordsByEmployee,
    insertClockRecord,
    fetchNotificationsByEmployee,
    fetchAllNotifications,
    insertNotification,
    markNotificationRead,
    archiveNotification,
    deleteNotification,
  };
}
