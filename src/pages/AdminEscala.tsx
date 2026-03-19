import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type ShiftType = "Manhã" | "Tarde" | "Noite";

interface ScheduleRow {
  id: string;
  employee_id: string;
  date: string;
  shift: ShiftType;
  start_time: string;
  end_time: string;
}

interface EmpOption {
  id: string;
  full_name: string;
}

const SHIFTS: ShiftType[] = ["Manhã", "Tarde", "Noite"];
const SHIFT_DEFAULTS: Record<ShiftType, { start: string; end: string }> = {
  "Manhã": { start: "06:00", end: "14:00" },
  Tarde: { start: "14:00", end: "22:00" },
  Noite: { start: "22:00", end: "06:00" },
};
const SHIFT_COLORS: Record<ShiftType, string> = {
  "Manhã": "bg-primary/15 text-primary border-primary/30",
  Tarde: "bg-accent/15 text-accent-foreground border-accent/30",
  Noite: "bg-foreground/10 text-foreground border-foreground/20",
};
const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getMonthDays(year: number, month: number) {
  const days: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function toISO(d: Date) { return d.toISOString().slice(0, 10); }

const AdminEscala = () => {
  const [employees, setEmployees] = useState<EmpOption[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Calendar nav
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  const todayStr = toISO(new Date());

  // Form
  const [showForm, setShowForm] = useState(false);
  const [formEmpId, setFormEmpId] = useState("");
  const [formDate, setFormDate] = useState(todayStr);
  const [formShift, setFormShift] = useState<ShiftType>("Manhã");
  const [formStart, setFormStart] = useState("06:00");
  const [formEnd, setFormEnd] = useState("14:00");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(days.length).padStart(2, "0")}`;
    const [empRes, schRes] = await Promise.all([
      supabase.from("employees").select("id, full_name").order("full_name"),
      supabase.from("work_schedules").select("*").gte("date", startDate).lte("date", endDate).order("date"),
    ]);
    setEmployees((empRes.data as EmpOption[]) ?? []);
    setSchedules((schRes.data as ScheduleRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { setLoading(true); loadData(); }, [year, month]);

  const handleShiftChange = (s: ShiftType) => {
    setFormShift(s);
    setFormStart(SHIFT_DEFAULTS[s].start);
    setFormEnd(SHIFT_DEFAULTS[s].end);
  };

  const addSchedule = async () => {
    if (!formEmpId || !formDate) return;
    setSaving(true);
    const { error } = await supabase.from("work_schedules").insert({
      employee_id: formEmpId, date: formDate, shift: formShift,
      start_time: formStart, end_time: formEnd,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Escala adicionada!");
    setShowForm(false);
    loadData();
  };

  const deleteSchedule = async (id: string) => {
    await supabase.from("work_schedules").delete().eq("id", id);
    toast.success("Escala removida!");
    loadData();
  };

  const getEmpName = (id: string) => employees.find((e) => e.id === id)?.full_name ?? "—";
  const filteredEmps = employees.filter((e) => e.full_name.toLowerCase().includes(search.toLowerCase()));

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  // Build calendar grid
  const firstDayOfWeek = days[0].getDay();
  const calendarCells: (Date | null)[] = Array.from({ length: firstDayOfWeek }, () => null).concat(days);

  return (
    <div className="max-w-5xl space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm font-bold capitalize">
            {viewDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> Nova Escala
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar funcionário..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-input bg-background text-sm" />
          </div>
          <select value={formEmpId} onChange={(e) => setFormEmpId(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
            <option value="">Selecionar funcionário</option>
            {filteredEmps.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
            <select value={formShift} onChange={(e) => handleShiftChange(e.target.value as ShiftType)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm">
              {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="time" value={formStart} onChange={(e) => setFormStart(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
            <input type="time" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <button onClick={addSchedule} disabled={saving || !formEmpId} className="w-full flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Adicionar
          </button>
        </div>
      )}

      {/* Calendar grid */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-7">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-bold text-muted-foreground py-2 border-b border-border">{d}</div>
          ))}
          {calendarCells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-border bg-muted/30" />;
            const dateStr = toISO(day);
            const isToday = dateStr === todayStr;
            const daySchedules = schedules.filter((s) => s.date === dateStr);
            return (
              <div key={dateStr} className={`min-h-[80px] border-b border-r border-border p-1 ${isToday ? "bg-primary/5" : ""}`}>
                <span className={`text-xs font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}>{day.getDate()}</span>
                <div className="space-y-0.5 mt-0.5">
                  {daySchedules.map((s) => (
                    <div key={s.id} className={`text-[9px] leading-tight rounded px-1 py-0.5 border ${SHIFT_COLORS[s.shift]} group relative`}>
                      <span className="font-semibold">{getEmpName(s.employee_id).split(" ")[0]}</span>
                      <br />{s.start_time?.slice(0,5)}-{s.end_time?.slice(0,5)}
                      <button onClick={() => deleteSchedule(s.id)} className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[8px]">
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminEscala;
