import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Send, Search, Check } from "lucide-react";
import { toast } from "sonner";

interface EmpOption {
  id: string;
  full_name: string;
  department: string;
}

interface NotifRow {
  id: string;
  employee_id: string | null;
  title: string;
  message: string;
  date_time: string;
  image_url: string | null;
}

const AdminAvisos = () => {
  const [employees, setEmployees] = useState<EmpOption[]>([]);
  const [notifications, setNotifications] = useState<NotifRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetType, setTargetType] = useState<"all" | "department" | "individual">("all");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    const [empRes, notRes] = await Promise.all([
      supabase.from("employees").select("id, full_name, department").order("full_name"),
      supabase.from("notifications").select("*").order("date_time", { ascending: false }).limit(50),
    ]);
    setEmployees((empRes.data as EmpOption[]) ?? []);
    setNotifications((notRes.data as NotifRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const departments = [...new Set(employees.map((e) => e.department))].sort();

  const filteredEmps = employees.filter((e) => {
    if (search && !e.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (targetType === "department" && selectedDept && e.department !== selectedDept) return false;
    return true;
  });

  const toggleEmp = (id: string) => {
    setSelectedEmpIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) { toast.error("Preencha título e mensagem."); return; }
    setSending(true);

    let targetIds: (string | null)[] = [];
    if (targetType === "all") {
      targetIds = [null]; // broadcast
    } else if (targetType === "department") {
      targetIds = employees.filter((e) => e.department === selectedDept).map((e) => e.id);
    } else {
      targetIds = selectedEmpIds;
    }

    if (targetIds.length === 0) { toast.error("Selecione ao menos um destinatário."); setSending(false); return; }

    const inserts = targetIds.map((empId) => ({
      employee_id: empId,
      title: title.trim(),
      message: message.trim(),
      image_url: imageUrl.trim() || null,
      date_time: new Date().toISOString(),
      read: false,
    }));

    const { error } = await supabase.from("notifications").insert(inserts);
    setSending(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Aviso enviado para ${targetIds.length === 1 && targetIds[0] === null ? "todos" : targetIds.length + " destinatário(s)"}!`);
    setTitle(""); setMessage(""); setImageUrl(""); setSelectedEmpIds([]);
    load();
  };

  const deleteNotif = async (id: string) => {
    // notifications table doesn't have delete policy for admins, but let's try
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) { toast.error("Sem permissão para excluir."); return; }
    load();
  };

  const getEmpName = (id: string | null) => id ? employees.find((e) => e.id === id)?.full_name ?? "—" : "Todos";

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl space-y-4">
      {/* Send form */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Enviar Aviso</h3>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do aviso" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mensagem" rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" />
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL da imagem (opcional)" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />

        {/* Target */}
        <div className="flex gap-2">
          {(["all", "department", "individual"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTargetType(t); setSelectedEmpIds([]); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                targetType === t ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {t === "all" ? "Todos" : t === "department" ? "Departamento" : "Individual"}
            </button>
          ))}
        </div>

        {targetType === "department" && (
          <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
            <option value="">Selecionar departamento</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        )}

        {targetType === "individual" && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-input bg-background text-sm" />
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {filteredEmps.map((e) => (
                <button key={e.id} onClick={() => toggleEmp(e.id)} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border transition ${selectedEmpIds.includes(e.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`}>
                  {selectedEmpIds.includes(e.id) && <Check className="h-3 w-3" />}
                  {e.full_name.split(" ")[0]}
                </button>
              ))}
            </div>
          </>
        )}

        <button onClick={sendNotification} disabled={sending} className="w-full flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Enviar
        </button>
      </div>

      {/* Recent notifications */}
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avisos Recentes</h3>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-start gap-3 bg-card rounded-xl border border-border p-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{n.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Para: {getEmpName(n.employee_id)} • {new Date(n.date_time).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <button onClick={() => deleteNotif(n.id)} className="text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {notifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum aviso enviado.</p>}
      </div>
    </div>
  );
};

export default AdminAvisos;
