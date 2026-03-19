import { useState, useMemo, useEffect } from "react";
import { useFuncionarioAtual } from "@/contexts/CurrentEmployeeContext";
import { useSupabaseDatabase } from "@/hooks/useSupabaseDatabase";
import type { Notification } from "@/data/types";
import { Bell, ChevronLeft, Loader2, CheckCheck, Archive, Trash2, MoreVertical } from "lucide-react";
import { toast } from "sonner";

const Notificacoes = () => {
  const { currentEmployee } = useFuncionarioAtual();
  const { fetchNotificationsByEmployee, markNotificationRead, archiveNotification, deleteNotification } = useSupabaseDatabase();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentEmployee) return;
    setLoading(true);
    fetchNotificationsByEmployee(currentEmployee.id).then(setNotifications).finally(() => setLoading(false));
  }, [currentEmployee, fetchNotificationsByEmployee]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const sorted = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
    [notifications]
  );

  const handleMarkAsRead = async (notif: Notification) => {
    if (!notif.read) {
      await markNotificationRead(notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    }
    setSelected({ ...notif, read: true });
  };

  const handleMarkReadOnly = async (e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (notif.read) { toast.info("Já marcada como lida."); return; }
    await markNotificationRead(notif.id);
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    toast.success("Marcada como lida.");
  };

  const handleArchive = async (e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation();
    setOpenMenuId(null);
    try {
      await archiveNotification(notif.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      if (selected?.id === notif.id) setSelected(null);
      toast.success("Notificação arquivada.");
    } catch {
      toast.error("Erro ao arquivar.");
    }
  };

  const handleDelete = async (e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation();
    setOpenMenuId(null);
    try {
      await deleteNotification(notif.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      if (selected?.id === notif.id) setSelected(null);
      toast.success("Notificação excluída.");
    } catch {
      toast.error("Erro ao excluir.");
    }
  };

  if (!currentEmployee) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-5">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <Bell className="h-8 w-8 text-success" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">Nenhum perfil selecionado.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (selected) {
    const dt = new Date(selected.dateTime);
    return (
      <div className="flex flex-col gap-4 px-5 py-4 max-w-md mx-auto">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-primary font-bold self-start">
          <ChevronLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border space-y-3">
          <h2 className="text-base font-bold text-card-foreground">{selected.title}</h2>
          <p className="text-xs text-muted-foreground">
            {dt.toLocaleDateString("pt-BR")} às {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
          {selected.imageUrl && (
            <img src={selected.imageUrl} alt={selected.title} className="w-full rounded-xl object-cover max-h-64" />
          )}
          <p className="text-sm text-card-foreground leading-relaxed">{selected.message}</p>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <button
              onClick={(e) => handleArchive(e, selected)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-muted py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent transition"
            >
              <Archive className="h-3.5 w-3.5" /> Arquivar
            </button>
            <button
              onClick={(e) => handleDelete(e, selected)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition"
            >
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-4 max-w-md mx-auto">
      {unreadCount > 0 && (
        <div className="flex items-center gap-2 bg-primary/10 rounded-2xl px-4 py-3">
          <Bell className="h-4 w-4 text-primary" />
          <p className="text-xs font-bold text-primary">
            {unreadCount} nova{unreadCount > 1 ? "s" : ""} notificaç{unreadCount > 1 ? "ões" : "ão"}
          </p>
        </div>
      )}
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-10 text-center">Você não tem notificações.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((n) => {
            const dt = new Date(n.dateTime);
            const menuOpen = openMenuId === n.id;
            return (
              <div key={n.id} className="relative">
                <button
                  onClick={() => handleMarkAsRead(n)}
                  className={`flex items-start gap-3 w-full rounded-2xl p-4 text-left shadow-sm transition active:scale-[0.98] border ${
                    n.read ? "border-border bg-card" : "border-primary/20 bg-primary/5"
                  }`}
                >
                  <div className={`mt-0.5 flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden ${n.read ? "bg-muted" : "bg-primary/10"}`}>
                    {n.imageUrl ? (
                      <img src={n.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Bell className={`h-5 w-5 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className={`text-sm truncate ${n.read ? "font-medium text-card-foreground" : "font-bold text-foreground"}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {dt.toLocaleDateString("pt-BR")} às {dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!n.read && <span className="h-2.5 w-2.5 rounded-full bg-primary mt-2 flex-shrink-0" />}
                </button>

                {/* Actions menu toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(menuOpen ? null : n.id); }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted transition"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Dropdown actions */}
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute top-10 right-3 z-20 bg-card rounded-xl shadow-lg border border-border py-1 min-w-[160px] animate-in fade-in zoom-in-95">
                      <button
                        onClick={(e) => handleMarkReadOnly(e, n)}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition"
                      >
                        <CheckCheck className="h-3.5 w-3.5 text-primary" /> Marcar como lida
                      </button>
                      <button
                        onClick={(e) => handleArchive(e, n)}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition"
                      >
                        <Archive className="h-3.5 w-3.5 text-muted-foreground" /> Arquivar
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, n)}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notificacoes;