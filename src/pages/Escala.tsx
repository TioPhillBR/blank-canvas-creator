import { useState, useMemo, useEffect } from "react";
import { useFuncionarioAtual } from "@/contexts/CurrentEmployeeContext";
import { useSupabaseDatabase } from "@/hooks/useSupabaseDatabase";
import type { WorkSchedule } from "@/data/types";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const SHIFT_COLORS: Record<string, string> = {
  "Manhã": "bg-primary text-primary-foreground",
  Tarde: "bg-accent text-accent-foreground",
  Noite: "bg-foreground text-background",
};

const Escala = () => {
  const { currentEmployee } = useFuncionarioAtual();
  const { fetchSchedulesByEmployee } = useSupabaseDatabase();
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (!currentEmployee) return;
    setLoading(true);
    fetchSchedulesByEmployee(currentEmployee.id).then(setSchedules).finally(() => setLoading(false));
  }, [currentEmployee, fetchSchedulesByEmployee]);

  const weekStart = useMemo(() => {
    const base = getWeekStart(new Date());
    base.setDate(base.getDate() + weekOffset * 7);
    return base;
  }, [weekOffset]);

  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const todayStr = toISODate(new Date());

  if (!currentEmployee) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-5">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <CalendarDays className="h-8 w-8 text-accent-foreground" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Nenhum funcionário selecionado. Acesse via pulseira NFC.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const weekEndDate = days[6];
  const rangeLabel = `${days[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} — ${weekEndDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;

  return (
    <div className="flex flex-col gap-4 px-5 py-4 max-w-md mx-auto">
      {/* Week nav */}
      <div className="flex items-center justify-between bg-card rounded-2xl p-3 shadow-sm border border-border">
        <button onClick={() => setWeekOffset((o) => o - 1)} className="p-2 rounded-xl hover:bg-muted transition">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-sm font-bold text-card-foreground capitalize">{rangeLabel}</span>
        <button onClick={() => setWeekOffset((o) => o + 1)} className="p-2 rounded-xl hover:bg-muted transition">
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Days */}
      <div className="space-y-2">
        {days.map((day) => {
          const dateStr = toISODate(day);
          const isToday = dateStr === todayStr;
          const daySchedule = schedules.find((s) => s.date === dateStr);
          const dayIndex = day.getDay();
          return (
            <div
              key={dateStr}
              className={`rounded-2xl border p-4 shadow-sm transition ${
                isToday ? "border-primary bg-primary/5 shadow-primary/10" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {DAY_NAMES[dayIndex]}
                  </span>
                  <span className="text-sm font-semibold text-card-foreground">
                    {day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Hoje
                    </span>
                  )}
                </div>
                {daySchedule && (
                  <span className={`rounded-xl px-3 py-1 text-[10px] font-bold ${SHIFT_COLORS[daySchedule.shift] ?? "bg-muted text-muted-foreground"}`}>
                    {daySchedule.shift}
                  </span>
                )}
              </div>
              {daySchedule ? (
                <p className="mt-2 text-lg font-bold text-card-foreground">
                  {daySchedule.startTime} <span className="text-muted-foreground font-normal text-base">–</span> {daySchedule.endTime}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground italic">Folga</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Escala;
