import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useSupabaseDatabase } from "@/hooks/useSupabaseDatabase";
import { useFuncionarioAtual } from "@/contexts/CurrentEmployeeContext";
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";
import { HeartPulse, Clock, CalendarDays, Bell, User, Building2, Loader2, Shield, LogOut } from "lucide-react";
import type { Employee, Wristband, WorkSchedule } from "@/data/types";
import PublicProfileComponent from "@/components/PublicProfile";

const shortcuts = [
  { label: "Saúde", icon: HeartPulse, path: "/saude", color: "bg-destructive/10 text-destructive" },
  { label: "Escala", icon: CalendarDays, path: "/escala", color: "bg-accent/20 text-accent-foreground" },
  { label: "Ponto", icon: Clock, path: "/ponto", color: "bg-primary/10 text-primary" },
  { label: "Avisos", icon: Bell, path: "/notificacoes", color: "bg-success/10 text-success" },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const Index = () => {
  const navigate = useNavigate();
  const { fetchEmployees, fetchWristbands, fetchSchedulesByEmployee, fetchClockRecordsByEmployee } = useSupabaseDatabase();
  const { currentEmployee, loading: employeeLoading } = useFuncionarioAtual();
  const { role, signOut, user } = useAuth();

  const isAdmin = role === "admin";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [wristbands, setWristbands] = useState<Wristband[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<WorkSchedule | null>(null);
  const [todayRecordCount, setTodayRecordCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchWristbands()])
      .then(([emps, wbs]) => {
        setEmployees(emps);
        setWristbands(wbs);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados iniciais:", err);
        setEmployees([]);
        setWristbands([]);
      })
      .finally(() => setLoading(false));
  }, [fetchEmployees, fetchWristbands]);

  useEffect(() => {
    if (!currentEmployee) return;
    const today = new Date().toISOString().slice(0, 10);
    fetchSchedulesByEmployee(currentEmployee.id).then((schedules) => {
      setTodaySchedule(schedules.find((s) => s.date === today) ?? null);
    });
    fetchClockRecordsByEmployee(currentEmployee.id).then((records) => {
      setTodayRecordCount(records.filter((r) => r.dateTime.startsWith(today)).length);
    });
  }, [currentEmployee, fetchSchedulesByEmployee, fetchClockRecordsByEmployee]);

  const getWristbandCode = (employeeId: string) =>
    wristbands.find((w) => w.employeeId === employeeId)?.code ?? "";

  if (isAdmin) return <AdminDashboard />;

  // Parceiro: show public profile as home page
  if (role === "parceiro" && currentEmployee) {
    const wbCode = getWristbandCode(currentEmployee.id);
    if (!wbCode && !loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    return (
      <PublicProfileComponent
        employee={currentEmployee}
        pulseiraId={wbCode}
        wristbandRole="parceiro"
        isPrivateView
        onLogout={signOut}
      />
    );
  }

  if (loading || employeeLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ===== Logged-in employee view =====
  if (currentEmployee) {
    const firstName = currentEmployee.fullName.split(" ")[0];
    const todayLabel = new Date().toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return (
      <div className="flex flex-col min-h-0">
        {/* Hero header */}
        <div className="hero-gradient relative overflow-hidden px-5 pt-5 pb-10">
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-accent/15" />
          <div className="absolute right-8 top-20 w-16 h-16 rounded-full bg-accent/10" />

          <div className="relative z-10">
            <div className="flex justify-end mb-4 gap-2">
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold bg-destructive/20 text-hero-foreground/80 backdrop-blur-sm"
              >
                <LogOut className="h-3 w-3" />
                Sair
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-hero-foreground/70 text-sm font-medium">{getGreeting()},</p>
                <h1 className="text-2xl font-bold text-hero-foreground mt-0.5">{firstName}</h1>
                <p className="text-hero-foreground/60 text-xs mt-1">{currentEmployee.role}</p>
              </div>
              <div className="h-16 w-16 rounded-full border-3 border-hero-foreground/30 overflow-hidden shadow-lg">
                {currentEmployee.photoUrl ? (
                  <img src={currentEmployee.photoUrl} alt={currentEmployee.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-xl font-bold">
                    {firstName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-5 text-background">
            <path d="M0,24 L0,0 Q200,28 400,0 L400,24 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="px-5 -mt-4 space-y-4 pb-4">
          {/* Today's schedule card */}
          <div className="bg-card rounded-3xl p-5 shadow-md border border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-card-foreground">Escala de Hoje</h2>
              <span className="text-xs text-muted-foreground capitalize">{todayLabel}</span>
            </div>
            {todaySchedule ? (
              <>
                <div className="flex items-baseline justify-center gap-3 my-2">
                  <span className="text-3xl font-bold text-card-foreground tracking-tight">{todaySchedule.startTime}</span>
                  <span className="text-xl text-muted-foreground">–</span>
                  <span className="text-3xl font-bold text-card-foreground tracking-tight">{todaySchedule.endTime}</span>
                </div>
                <button
                  onClick={() => navigate("/ponto")}
                  className="w-full mt-3 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.97] transition"
                >
                  {todayRecordCount === 0 ? "Registrar Entrada" : "Registrar Ponto"}
                </button>
              </>
            ) : (
              <p className="text-center text-sm text-muted-foreground italic py-4">
                Sem escala para hoje
              </p>
            )}
          </div>

          {/* Quick action icons */}
          <div className="flex items-center justify-around py-2">
            {shortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${item.color} transition group-active:scale-95`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* More links */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/institucional")}
              className="flex-1 flex items-center gap-3 bg-card rounded-2xl p-4 shadow-sm border border-border active:scale-[0.98] transition"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-card-foreground">Institucional</span>
            </button>
            <button
              onClick={() => navigate("/perfil")}
              className="flex-1 flex items-center gap-3 bg-card rounded-2xl p-4 shadow-sm border border-border active:scale-[0.98] transition"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20">
                <User className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-sm font-semibold text-card-foreground">Meu Perfil</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Employee selection (for users without a linked employee) =====
  return (
    <div className="flex flex-col min-h-0">
      <div className="hero-gradient relative overflow-hidden px-5 pt-8 pb-12">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-accent/15" />
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-bold text-hero-foreground">Feel One</h1>
          <p className="text-hero-foreground/60 text-sm mt-2">
            Escaneie sua pulseira NFC ou selecione abaixo
          </p>
          <div className="flex justify-center mt-3 gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold bg-hero-foreground/15 text-hero-foreground/80 backdrop-blur-sm">
              <User className="h-3 w-3" />
              Funcionário
            </span>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold bg-destructive/20 text-hero-foreground/80 backdrop-blur-sm"
            >
              <LogOut className="h-3 w-3" />
              Sair
            </button>
          </div>
        </div>
        <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-5 text-background">
          <path d="M0,24 L0,0 Q200,28 400,0 L400,24 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="px-5 -mt-4 space-y-3 pb-4">
        {isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.97] transition mb-2"
          >
            <Shield className="h-4 w-4" />
            Painel Administrativo
          </button>
        )}
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          Colaboradores
        </h2>
        {employees.map((emp) => {
          const code = getWristbandCode(emp.id);
          return (
            <button
              key={emp.id}
              onClick={() => navigate(`/pulseira/${code}`)}
              className="flex items-center gap-3 w-full rounded-2xl bg-card p-4 text-left shadow-sm border border-border transition hover:shadow-md active:scale-[0.98]"
            >
              <div className="h-12 w-12 rounded-full overflow-hidden shadow-sm border-2 border-border">
                {emp.photoUrl ? (
                  <img src={emp.photoUrl} alt={emp.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground font-bold">
                    {emp.fullName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-card-foreground truncate">{emp.fullName}</p>
                <p className="text-xs text-muted-foreground">{emp.role}</p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-lg">{code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Index;
