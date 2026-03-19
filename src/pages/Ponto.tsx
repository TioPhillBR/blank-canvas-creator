import { useState, useMemo, useEffect, useCallback } from "react";
import { useFuncionarioAtual } from "@/contexts/CurrentEmployeeContext";
import { useSupabaseDatabase } from "@/hooks/useSupabaseDatabase";
import type { ClockRecord, ClockEventType, GeoLocation } from "@/data/types";
import { Clock, LogIn, LogOut, UtensilsCrossed, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS: Record<ClockEventType, string> = {
  entrada: "Entrada",
  "saída": "Saída",
  "saída-almoço": "Saída Almoço",
  "retorno-almoço": "Retorno Almoço",
};

const TYPE_ICONS: Record<ClockEventType, React.ElementType> = {
  entrada: LogIn,
  "saída": LogOut,
  "saída-almoço": UtensilsCrossed,
  "retorno-almoço": UtensilsCrossed,
};

const Ponto = () => {
  const { currentEmployee } = useFuncionarioAtual();
  const { fetchClockRecordsByEmployee, insertClockRecord } = useSupabaseDatabase();

  const [records, setRecords] = useState<ClockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (!currentEmployee) return;
    setLoading(true);
    fetchClockRecordsByEmployee(currentEmployee.id)
      .then(setRecords)
      .catch((err) => {
        console.error("Erro ao carregar registros de ponto:", err);
        setRecords([]);
        toast.error("Falha de conexão ao carregar registros.");
      })
      .finally(() => setLoading(false));
  }, [currentEmployee, fetchClockRecordsByEmployee]);

  const sorted = useMemo(
    () => [...records].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
    [records]
  );

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monthStr = now.toISOString().slice(0, 7);
  const todayCount = records.filter((r) => r.dateTime.startsWith(todayStr)).length;
  const monthCount = records.filter((r) => r.dateTime.startsWith(monthStr)).length;

  const getLocation = useCallback((): Promise<GeoLocation | undefined> => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) { resolve(undefined); return; }
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => { setGettingLocation(false); resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }); },
        () => { setGettingLocation(false); resolve(undefined); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  const handleRegister = async (type: ClockEventType) => {
    if (!currentEmployee) return;
    const location = await getLocation();
    if ("vibrate" in navigator) navigator.vibrate(100);
    try {
      const newRecord = await insertClockRecord(currentEmployee.id, type, location);
      setRecords((prev) => [newRecord, ...prev]);
      toast.success(`${TYPE_LABELS[type]} registrada com sucesso!`);
    } catch {
      toast.error("Erro ao registrar ponto.");
    }
  };

  if (!currentEmployee) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">Nenhum funcionário selecionado.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-4 max-w-md mx-auto">
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <ActionButton label="Entrada" icon={LogIn} onClick={() => handleRegister("entrada")} variant="primary" disabled={gettingLocation} />
        <ActionButton label="Saída" icon={LogOut} onClick={() => handleRegister("saída")} variant="secondary" disabled={gettingLocation} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ActionButton label="Saída Almoço" icon={UtensilsCrossed} onClick={() => handleRegister("saída-almoço")} variant="lunch" disabled={gettingLocation} />
        <ActionButton label="Retorno Almoço" icon={UtensilsCrossed} onClick={() => handleRegister("retorno-almoço")} variant="lunch" disabled={gettingLocation} />
      </div>

      {gettingLocation && <p className="text-xs text-center text-muted-foreground animate-pulse">Obtendo localização…</p>}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm border border-border">
          <p className="text-3xl font-bold text-primary">{todayCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Hoje</p>
        </div>
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm border border-border">
          <p className="text-3xl font-bold text-primary">{monthCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Este mês</p>
        </div>
      </div>

      {/* History */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registros</h2>
        </div>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-6">Nenhum registro encontrado.</p>
        ) : (
          sorted.map((r) => {
            const dt = new Date(r.dateTime);
            const Icon = TYPE_ICONS[r.type];
            const isEntry = r.type === "entrada";
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm border border-border">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isEntry ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-card-foreground flex items-center gap-2">
                    {TYPE_LABELS[r.type]}
                    {r.edited && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Editado</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dt.toLocaleDateString("pt-BR")} às {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {r.location && (
                  <a
                    href={`https://www.google.com/maps?q=${r.location.latitude},${r.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                    title={`${r.location.latitude.toFixed(6)}, ${r.location.longitude.toFixed(6)}`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const ActionButton = ({
  label, icon: Icon, onClick, variant, disabled,
}: {
  label: string; icon: React.ElementType; onClick: () => void; variant: "primary" | "secondary" | "lunch"; disabled?: boolean;
}) => {
  const styles = {
    primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
    secondary: "bg-card border border-border text-card-foreground shadow-sm",
    lunch: "bg-accent/15 border border-accent/30 text-accent-foreground shadow-sm",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-bold active:scale-[0.97] transition disabled:opacity-50 ${styles[variant]}`}>
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
};

export default Ponto;
