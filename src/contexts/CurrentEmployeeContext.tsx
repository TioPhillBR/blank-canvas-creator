import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { mapEmployee } from "@/data/types";
import type { Employee } from "@/data/types";

interface CurrentEmployeeContextValue {
  currentEmployee: Employee | null;
  setCurrentEmployee: (employee: Employee | null) => void;
  logout: () => void;
  loading: boolean;
}

const CurrentEmployeeContext = createContext<CurrentEmployeeContextValue | undefined>(undefined);

export const CurrentEmployeeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const logout = useCallback(() => setCurrentEmployee(null), []);

  // Auto-resolve employee from profile when user logs in
  useEffect(() => {
    if (!user) {
      setCurrentEmployee(null);
      return;
    }

    // Don't override if already set (e.g. via NFC or admin selection)
    if (currentEmployee) return;

    let active = true;
    setLoading(true);

    (async () => {
      try {
        // 1. Check if user has a profile with employee_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("employee_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!active) return;

        if (profile?.employee_id) {
          const { data: emp } = await supabase
            .from("employees")
            .select("*")
            .eq("id", profile.employee_id)
            .maybeSingle();

          if (active && emp) {
            setCurrentEmployee(mapEmployee(emp));
          }
        } else {
          // 2. Fallback: check if user has a wristband linked
          const { data: wb } = await supabase
            .from("wristbands")
            .select("employee_id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!active || !wb?.employee_id) return;

          const { data: emp } = await supabase
            .from("employees")
            .select("*")
            .eq("id", wb.employee_id)
            .maybeSingle();

          if (active && emp) {
            setCurrentEmployee(mapEmployee(emp));
          }
        }
      } catch (err) {
        console.error("Error resolving employee for user:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [user]); // intentionally not including currentEmployee

  return (
    <CurrentEmployeeContext.Provider value={{ currentEmployee, setCurrentEmployee, logout, loading }}>
      {children}
    </CurrentEmployeeContext.Provider>
  );
};

export function useFuncionarioAtual() {
  const ctx = useContext(CurrentEmployeeContext);
  if (!ctx) throw new Error("useFuncionarioAtual must be used within CurrentEmployeeProvider");
  return ctx;
}
