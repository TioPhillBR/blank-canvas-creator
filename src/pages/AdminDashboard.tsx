import { useState, useEffect, useMemo } from "react";
import { useSupabaseDatabase } from "@/hooks/useSupabaseDatabase";
import type { Employee } from "@/data/types";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Nfc, Briefcase, Newspaper, Calendar, Bell, FileUp, Loader2,
  TrendingUp, Clock, Heart, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

interface DashboardStats {
  employees: number;
  wristbands: number;
  wristbandsLinked: number;
  opportunities: number;
  events: number;
  news: number;
  resumes: number;
  notifications: number;
  clockRecordsMonth: number;
  schedulesMonth: number;
}

const AdminDashboard = () => {
  const { fetchEmployees, fetchWristbands } = useSupabaseDatabase();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [clockRecords, setClockRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const monthStr = now.toISOString().slice(0, 7);

  useEffect(() => {
    const load = async () => {
      try {
        const [emps, wbs, opp, ev, nw, res, notif, clockRes, schRes] = await Promise.all([
          fetchEmployees(),
          fetchWristbands(),
          supabase.from("opportunities").select("id", { count: "exact", head: true }),
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("news").select("id", { count: "exact", head: true }),
          supabase.from("resumes").select("id", { count: "exact", head: true }),
          supabase.from("notifications").select("id", { count: "exact", head: true }),
          supabase.from("clock_records").select("*").gte("date_time", `${monthStr}-01T00:00:00`).order("date_time"),
          supabase.from("work_schedules").select("id", { count: "exact", head: true }).gte("date", `${monthStr}-01`),
        ]);
        setAllEmployees(emps);
        setRecentEmployees(emps.slice(0, 5));
        setClockRecords(clockRes.data ?? []);
        setStats({
          employees: emps.length,
          wristbands: wbs.length,
          wristbandsLinked: wbs.filter((w) => w.employeeId).length,
          opportunities: opp.count ?? 0,
          events: ev.count ?? 0,
          news: nw.count ?? 0,
          resumes: res.count ?? 0,
          notifications: notif.count ?? 0,
          clockRecordsMonth: clockRes.data?.length ?? 0,
          schedulesMonth: schRes.count ?? 0,
        });
      } catch {
        toast.error("Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchEmployees, fetchWristbands]);

  // Chart: employees by department
  const deptChart = useMemo(() => {
    const map: Record<string, number> = {};
    allEmployees.forEach((e) => { map[e.department] = (map[e.department] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [allEmployees]);

  // Chart: clock records by day (last 14 days)
  const clockByDay = useMemo(() => {
    const map: Record<string, number> = {};
    clockRecords.forEach((r: any) => {
      const day = r.date_time.slice(0, 10);
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).sort().slice(-14).map(([date, count]) => ({
      date: new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      registros: count,
    }));
  }, [clockRecords]);

  if (loading || !stats) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const statCards = [
    { label: "Funcionários", value: stats.employees, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Pulseiras NFC", value: stats.wristbands, sub: `${stats.wristbandsLinked} vinculadas`, icon: Nfc, color: "bg-accent/20 text-accent-foreground" },
    { label: "Vagas Ativas", value: stats.opportunities, icon: Briefcase, color: "bg-primary/10 text-primary" },
    { label: "Eventos", value: stats.events, icon: Calendar, color: "bg-accent/20 text-accent-foreground" },
    { label: "Notícias", value: stats.news, icon: Newspaper, color: "bg-primary/10 text-primary" },
    { label: "Currículos", value: stats.resumes, icon: FileUp, color: "bg-accent/20 text-accent-foreground" },
    { label: "Notificações", value: stats.notifications, icon: Bell, color: "bg-destructive/10 text-destructive" },
    { label: "Ponto (mês)", value: stats.clockRecordsMonth, icon: Clock, color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <div className="hero-gradient rounded-2xl p-6 lg:p-8 text-hero-foreground relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 top-6 w-20 h-20 rounded-full bg-white/5" />
        <div className="relative z-10">
          <p className="text-sm opacity-80">Bem-vindo ao</p>
          <h2 className="text-2xl lg:text-3xl font-bold mt-1">Painel Administrativo</h2>
          <p className="text-sm opacity-70 mt-2">Visão geral do sistema Silverado.</p>
        </div>
      </div>

      {/* Stat cards - no navigation, just info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col gap-2 rounded-2xl bg-card p-4 border border-border shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              {s.sub && <p className="text-[10px] text-muted-foreground -mt-1">{s.sub}</p>}
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Dept distribution */}
        <div className="rounded-2xl bg-card p-5 border border-border shadow-sm">
          <h3 className="text-sm font-bold text-card-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Funcionários por Departamento
          </h3>
          {deptChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptChart} cx="50%" cy="50%" outerRadius={75} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={false} style={{ fontSize: 10 }}>
                  {deptChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-10">Sem dados</p>
          )}
        </div>

        {/* Clock records trend */}
        <div className="rounded-2xl bg-card p-5 border border-border shadow-sm">
          <h3 className="text-sm font-bold text-card-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Registros de Ponto (mês)
          </h3>
          {clockByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={clockByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="registros" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-10">Sem registros neste mês</p>
          )}
        </div>
      </div>

      {/* Quick summary + Recent employees */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Quick summary */}
        <div className="rounded-2xl bg-card p-5 border border-border shadow-sm">
          <h3 className="text-sm font-bold text-card-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Resumo Rápido
          </h3>
          <div className="space-y-3">
            <SummaryRow label="Pulseiras vinculadas" value={`${stats.wristbandsLinked}/${stats.wristbands}`} pct={stats.wristbands ? Math.round((stats.wristbandsLinked / stats.wristbands) * 100) : 0} />
            <SummaryRow label="Registros de ponto este mês" value={String(stats.clockRecordsMonth)} />
            <SummaryRow label="Escalas programadas" value={String(stats.schedulesMonth)} />
            <SummaryRow label="Currículos recebidos" value={String(stats.resumes)} />
            <SummaryRow label="Vagas abertas" value={String(stats.opportunities)} />
          </div>
        </div>

        {/* Recent employees */}
        <div className="rounded-2xl bg-card p-5 border border-border shadow-sm">
          <h3 className="text-sm font-bold text-card-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Funcionários Recentes
          </h3>
          <div className="space-y-3">
            {recentEmployees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-border shrink-0">
                  {emp.photoUrl ? (
                    <img src={emp.photoUrl} alt={emp.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold">
                      {emp.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-card-foreground truncate">{emp.fullName}</p>
                  <p className="text-[11px] text-muted-foreground">{emp.role} · {emp.department}</p>
                </div>
              </div>
            ))}
            {recentEmployees.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum funcionário cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, pct }: { label: string; value: string; pct?: number }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-foreground">{value}</span>
      {pct !== undefined && (
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  </div>
);

export default AdminDashboard;
