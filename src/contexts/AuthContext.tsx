import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "admin" | "employee" | "parceiro" | "user" | null;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: AppRole;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_my_role");
    if (error) {
      console.error("Error fetching role:", error);
      return null;
    }
    return (data as AppRole) ?? null;
  }, []);

  const refreshRole = useCallback(async () => {
    if (!user) {
      setRole(null);
      return;
    }
    const r = await fetchRole();
    setRole(r);
  }, [user, fetchRole]);

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (!nextSession?.user) setRole(null);
      setLoading(false);
    });

    supabase.auth.getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.error("Error getting session:", error);
        }
        setSession(initialSession ?? null);
        setUser(initialSession?.user ?? null);
        if (!initialSession?.user) setRole(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Unexpected session init error:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }

    let active = true;
    fetchRole()
      .then((r) => {
        if (active) setRole(r);
      })
      .catch((err) => {
        console.error("Error resolving role:", err);
        if (active) setRole(null);
      });

    return () => {
      active = false;
    };
  }, [user, fetchRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

