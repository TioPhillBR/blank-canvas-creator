import { useState, useEffect } from "react";
import { useSupabaseDatabase } from "@/hooks/useSupabaseDatabase";
import type { Employee, Notification } from "@/data/types";
import { Send, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

const AdminNotificacoes = () => {
  const { fetchEmployees, fetchAllNotifications, insertNotification } = useSupabaseDatabase();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [target, setTarget] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchAllNotifications()])
      .then(([emps, notifs]) => {
        setEmployees(emps);
        setNotifications(notifs);
      })
      .finally(() => setLoading(false));
  }, [fetchEmployees, fetchAllNotifications]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      const n = await insertNotification(target === "all" ? null : target, title.trim(), message.trim());
      setNotifications((prev) => [n, ...prev]);
      setTitle("");
      setMessage("");
      setTarget("all");
      setShowForm(false);
      toast.success("Notificação enviada!");
    } catch {
      toast.error("Erro ao enviar.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{notifications.length} notificações enviadas</p>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 active:scale-[0.97] transition">
          <Plus className="h-4 w-4" /> Nova Notificação
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-card p-6 shadow-sm border border-border space-y-4">
          <h2 className="text-sm font-bold text-card-foreground">Enviar Notificação</h2>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Destinatário</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground">
              <option value="all">Todos os funcionários</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Título</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título..."
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Mensagem</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mensagem..." rows={3}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSend} disabled={!title.trim() || !message.trim() || sending}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50 active:scale-[0.97] transition">
              <Send className="h-4 w-4" />
              {sending ? "Enviando..." : "Enviar"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground font-medium">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className="rounded-2xl bg-card p-4 shadow-sm border border-border">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-card-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {n.employeeId === null ? "Todos" : employees.find((e) => e.id === n.employeeId)?.fullName ?? "—"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {new Date(n.dateTime).toLocaleDateString("pt-BR")} às {new Date(n.dateTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        ))}
        {notifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhuma notificação enviada.</p>}
      </div>
    </div>
  );
};

export default AdminNotificacoes;
