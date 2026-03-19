import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, BarChart3, Users, Clock, CalendarDays, Bell, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

const AdminRelatorios = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [clockRecords, setClockRecords] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterDept, setFilterDept] = useState("");

  const load = async () => {
    setLoading(true);
    const [empRes, clockRes, schRes, notRes, oppRes] = await Promise.all([
      supabase.from("employees").select("*").order("full_name"),
      supabase.from("clock_records").select("*").gte("date_time", `${filterMonth}-01T00:00:00`).order("date_time"),
      supabase.from("work_schedules").select("*").gte("date", `${filterMonth}-01`).order("date"),
      supabase.from("notifications").select("*").order("date_time", { ascending: false }).limit(200),
      supabase.from("opportunities").select("*"),
    ]);
    setEmployees(empRes.data ?? []);
    setClockRecords(clockRes.data ?? []);
    setSchedules(schRes.data ?? []);
    setNotifications(notRes.data ?? []);
    setOpportunities(oppRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterMonth]);

  const departments = [...new Set(employees.map((e: any) => e.department))].sort();
  const filteredEmps = filterDept ? employees.filter((e: any) => e.department === filterDept) : employees;
  const filteredEmpIds = new Set(filteredEmps.map((e: any) => e.id));
  const filteredClock = clockRecords.filter((r: any) => filteredEmpIds.has(r.employee_id));

  // Charts data
  const deptDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    employees.forEach((e: any) => { map[e.department] = (map[e.department] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const clockByDay = useMemo(() => {
    const map: Record<string, number> = {};
    filteredClock.forEach((r: any) => {
      const day = r.date_time.slice(0, 10);
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).sort().map(([date, count]) => ({
      date: new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      registros: count,
    }));
  }, [filteredClock]);

  const clockByType = useMemo(() => {
    const map: Record<string, number> = {};
    filteredClock.forEach((r: any) => { map[r.type] = (map[r.type] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredClock]);

  const bloodTypeDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    filteredEmps.forEach((e: any) => { map[e.blood_type] = (map[e.blood_type] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredEmps]);

  const exportCSV = (data: any[], filename: string, headers: string[]) => {
    const csv = [headers.join(","), ...data.map((row) => headers.map((h) => `"${row[h] ?? ""}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exportação concluída!");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm">
          <option value="">Todos os departamentos</option>
          {departments.map((d: string) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard icon={Users} label="Funcionários" value={filteredEmps.length} />
        <KPICard icon={Clock} label="Registros de Ponto" value={filteredClock.length} />
        <KPICard icon={CalendarDays} label="Escalas" value={schedules.filter((s: any) => filteredEmpIds.has(s.employee_id)).length} />
        <KPICard icon={Briefcase} label="Vagas Ativas" value={opportunities.filter((o: any) => o.is_active).length} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dept Distribution */}
        <ChartCard title="Funcionários por Departamento" onExport={() => exportCSV(deptDistribution, "departamentos", ["name", "value"])}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={deptDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                {deptDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Clock records by day */}
        <ChartCard title="Registros de Ponto por Dia" onExport={() => exportCSV(clockByDay, "ponto-por-dia", ["date", "registros"])}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={clockByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="registros" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Clock by type */}
        <ChartCard title="Registros por Tipo" onExport={() => exportCSV(clockByType, "ponto-por-tipo", ["name", "value"])}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={clockByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label>
                {clockByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Blood type */}
        <ChartCard title="Tipos Sanguíneos" onExport={() => exportCSV(bloodTypeDistribution, "tipos-sanguineos", ["name", "value"])}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bloodTypeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Full export */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Exportar Dados Completos</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportCSV(employees, "funcionarios", ["full_name", "email", "phone", "department", "role", "blood_type"])} className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            <Download className="h-4 w-4" /> Funcionários
          </button>
          <button onClick={() => exportCSV(clockRecords.map((r: any) => ({ ...r, employee_name: employees.find((e: any) => e.id === r.employee_id)?.full_name ?? "" })), "ponto", ["employee_name", "date_time", "type"])} className="flex items-center gap-1 rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold text-foreground hover:bg-muted">
            <Download className="h-4 w-4" /> Folha de Ponto
          </button>
          <button onClick={() => exportCSV(notifications, "notificacoes", ["title", "message", "date_time", "employee_id"])} className="flex items-center gap-1 rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold text-foreground hover:bg-muted">
            <Download className="h-4 w-4" /> Notificações
          </button>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) => (
  <div className="bg-card rounded-2xl border border-border p-4 text-center">
    <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const ChartCard = ({ title, children, onExport }: { title: string; children: React.ReactNode; onExport: () => void }) => (
  <div className="bg-card rounded-2xl border border-border p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <button onClick={onExport} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
        <Download className="h-3 w-3" /> CSV
      </button>
    </div>
    {children}
  </div>
);

export default AdminRelatorios;
