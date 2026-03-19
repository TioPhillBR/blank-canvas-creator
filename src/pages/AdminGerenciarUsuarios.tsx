import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Trash2, Pencil, Save, X, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  employee_id: string | null;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "employee" | "parceiro" | "user";
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  employee: "Funcionário",
  parceiro: "Parceiro",
  user: "Usuário",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/30",
  employee: "bg-primary/10 text-primary border-primary/30",
  parceiro: "bg-accent/10 text-accent-foreground border-accent/30",
  user: "bg-muted text-muted-foreground border-border",
};

const ALL_ROLES = ["admin", "employee", "parceiro", "user"] as const;

const AdminGerenciarUsuarios = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<{ userId: string; fullName: string; phone: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const [profRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    setProfiles((profRes.data as UserProfile[]) ?? []);
    setRoles((rolesRes.data as UserRole[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getUserRole = (userId: string) => roles.find((r) => r.user_id === userId);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.full_name?.toLowerCase().includes(q) ?? false) ||
      p.user_id.includes(q) ||
      (p.phone?.includes(q) ?? false)
    );
  });

  const startEditRole = (userId: string) => {
    const current = getUserRole(userId);
    setEditingUserId(userId);
    setEditRole(current?.role ?? "user");
  };

  const saveRole = async () => {
    if (!editingUserId) return;
    setSaving(true);
    const existing = getUserRole(editingUserId);
    if (existing) {
      // Delete old role and insert new one (since UPDATE is not allowed on user_roles)
      await supabase.from("user_roles").delete().eq("id", existing.id);
    }
    const { error } = await supabase.from("user_roles").insert({
      user_id: editingUserId,
      role: editRole as "admin" | "employee" | "parceiro" | "user",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Papel atualizado!");
    setEditingUserId(null);
    load();
  };

  const deleteRole = async (userId: string) => {
    const existing = getUserRole(userId);
    if (!existing) { toast.error("Usuário não possui papel."); return; }
    await supabase.from("user_roles").delete().eq("id", existing.id);
    toast.success("Papel removido!");
    setDeletingId(null);
    load();
  };

  const startEditProfile = (p: UserProfile) => {
    setEditingProfile({
      userId: p.user_id,
      fullName: p.full_name ?? "",
      phone: p.phone ?? "",
    });
  };

  const saveProfile = async () => {
    if (!editingProfile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: editingProfile.fullName || null,
      phone: editingProfile.phone || null,
    }).eq("user_id", editingProfile.userId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Perfil atualizado!");
    setEditingProfile(null);
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-5xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground flex-1">{filtered.length} usuário(s)</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-input bg-background pl-9 pr-4 py-2 text-sm w-64"
          />
        </div>
      </div>

      {/* Edit profile form */}
      {editingProfile && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Editar Perfil</h3>
            <button onClick={() => setEditingProfile(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nome completo</label>
              <input
                value={editingProfile.fullName}
                onChange={(e) => setEditingProfile((p) => p ? { ...p, fullName: e.target.value } : p)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Telefone</label>
              <input
                value={editingProfile.phone}
                onChange={(e) => setEditingProfile((p) => p ? { ...p, phone: e.target.value } : p)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveProfile} disabled={saving} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}
            </button>
            <button onClick={() => setEditingProfile(null)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground">Cancelar</button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deletingId && (
        <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/30 space-y-3 animate-in fade-in">
          <p className="text-sm font-bold text-destructive">Remover papel deste usuário?</p>
          <p className="text-xs text-muted-foreground">O usuário perderá suas permissões associadas ao papel atual.</p>
          <div className="flex gap-2">
            <button onClick={() => deleteRole(deletingId)} className="rounded-lg bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground">Sim, remover</button>
            <button onClick={() => setDeletingId(null)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground">Cancelar</button>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Usuário</th>
                <th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Telefone</th>
                <th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Papel</th>
                <th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Cadastro</th>
                <th className="text-right px-4 py-2 text-xs font-bold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const role = getUserRole(p.user_id);
                const isEditingRole = editingUserId === p.user_id;
                return (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-border shrink-0">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                              {(p.full_name ?? "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{p.full_name || "Sem nome"}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{p.user_id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.phone || "—"}</td>
                    <td className="px-4 py-3">
                      {isEditingRole ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="rounded-lg border border-input bg-background px-2 py-1 text-sm"
                          >
                            {ALL_ROLES.map((r) => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                          <button onClick={saveRole} disabled={saving} className="p-1 rounded-lg bg-primary text-primary-foreground">
                            <Save className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setEditingUserId(null)} className="p-1 rounded-lg hover:bg-muted">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <Badge className={`text-[10px] border ${ROLE_COLORS[role?.role ?? "user"]}`}>
                          {ROLE_LABELS[role?.role ?? "—"] ?? "Sem papel"}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(p.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => startEditProfile(p)} className="p-1.5 rounded-lg hover:bg-muted" title="Editar perfil">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => startEditRole(p.user_id)} className="p-1.5 rounded-lg hover:bg-muted" title="Alterar papel">
                          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        {role && (
                          <button onClick={() => setDeletingId(p.user_id)} className="p-1.5 rounded-lg hover:bg-destructive/10" title="Remover papel">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum usuário encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} usuário(s) encontrado(s)</p>
    </div>
  );
};

export default AdminGerenciarUsuarios;
