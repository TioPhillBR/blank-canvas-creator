import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseDatabase } from "@/hooks/useSupabaseDatabase";
import type { Employee, Wristband } from "@/data/types";
import {
  Nfc, Plus, Trash2, Copy, Pencil, Check, X, Loader2, ChevronLeft, Link2, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CODE_PREFIX = "NFC-SLV-";

function generateUniqueCode(existingCodes: Set<string>): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code: string;
  do {
    let suffix = "";
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code = `${CODE_PREFIX}${suffix}`;
  } while (existingCodes.has(code));
  return code;
}

interface WristbandWithUser extends Wristband {
  userId?: string | null;
  employeeName?: string;
  wristbandRole?: string;
}

const AdminPulseiras = () => {
  const { fetchEmployees } = useSupabaseDatabase();
  const navigate = useNavigate();

  const [wristbands, setWristbands] = useState<WristbandWithUser[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // New wristband form
  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "employee" | "parceiro">("employee");
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editEmployeeId, setEditEmployeeId] = useState("");

  const loadData = async () => {
    setLoading(true);
    const [emps, { data: wbs }] = await Promise.all([
      fetchEmployees(),
      supabase.from("wristbands").select("*").order("code"),
    ]);
    setEmployees(emps);
    setWristbands(
      (wbs ?? []).map((wb: any) => ({
        id: wb.id,
        code: wb.code,
        employeeId: wb.employee_id,
        userId: wb.user_id,
        employeeName: emps.find((e) => e.id === wb.employee_id)?.fullName ?? "—",
        wristbandRole: wb.role ?? "employee",
      }))
    );
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [fetchEmployees]);

  const handleCreate = async () => {
    if (!newCode.trim()) return;
    setSaving(true);
    const insertData: { code: string; employee_id?: string; role: string } = { code: newCode.trim(), role: newRole };
    if (newEmployeeId) insertData.employee_id = newEmployeeId;
    const { error } = await supabase
      .from("wristbands")
      .insert(insertData as any);
    if (error) toast.error(error.message);
    else { toast.success("Link gerado! Copie e envie ao funcionário."); setNewCode(""); setNewEmployeeId(""); setNewRole("employee"); setShowForm(false); await loadData(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("wristbands").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Pulseira removida!"); await loadData(); }
  };

  const handleStartEdit = (wb: WristbandWithUser) => {
    setEditingId(wb.id);
    setEditCode(wb.code);
    setEditEmployeeId(wb.employeeId);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editCode.trim() || !editEmployeeId) return;
    const { error } = await supabase
      .from("wristbands")
      .update({ code: editCode.trim(), employee_id: editEmployeeId })
      .eq("id", editingId);
    if (error) toast.error(error.message);
    else { toast.success("Pulseira atualizada!"); setEditingId(null); await loadData(); }
  };

  const copySignupLink = (code: string) => {
    const url = `${window.location.origin}/pulseira/${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
          <Nfc className="h-4 w-4 text-accent-foreground" />
        </div>
        <h1 className="text-lg font-bold text-foreground">Pulseiras NFC</h1>
        <span className="ml-auto text-xs text-muted-foreground">{wristbands.length} cadastradas</span>
      </div>

      {/* Add button */}
      <button onClick={() => {
          const existing = new Set(wristbands.map(w => w.code));
          setNewCode(generateUniqueCode(existing));
          setShowForm(true);
        }}
        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.97] transition">
        <Plus className="h-4 w-4" />
        Gerar Novo Link
      </button>

      {/* Create form — shows generated code + link */}
      {showForm && (
        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border space-y-4">
          <h2 className="text-sm font-bold text-card-foreground">Novo Link de Cadastro</h2>

          {/* Code */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Código da Pulseira</label>
            <div className="flex gap-2">
              <input type="text" value={newCode} readOnly
                className="flex-1 rounded-xl border border-input bg-muted px-4 py-2.5 text-sm text-foreground font-mono font-bold tracking-wide" />
              <button type="button" onClick={() => {
                  const existing = new Set(wristbands.map(w => w.code));
                  setNewCode(generateUniqueCode(existing));
                }}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition"
                title="Gerar novo código">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Link preview */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Link de cadastro</label>
            <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
              <Link2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs text-primary font-mono break-all select-all">
                {`${window.location.origin}/pulseira/${newCode}`}
              </span>
            </div>
            <button type="button" onClick={() => copySignupLink(newCode)}
              className="flex items-center gap-1.5 text-xs text-primary font-semibold mt-1">
              <Copy className="h-3 w-3" /> Copiar link
            </button>
          </div>

          {/* Role selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Papel do Usuário</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "admin" as const, label: "Administrador", desc: "Acesso total ao painel" },
                { value: "employee" as const, label: "Funcionário", desc: "Acesso ao app interno" },
                { value: "parceiro" as const, label: "Parceiro", desc: "Acesso limitado" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNewRole(opt.value)}
                  className={`rounded-xl border p-3 text-left transition ${
                    newRole === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <p className={`text-xs font-bold ${newRole === opt.value ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Envie este link ao funcionário. Ele será usado uma única vez para preencher o cadastro completo.
          </p>

          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newCode.trim() || saving}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50 active:scale-[0.97] transition">
              {saving ? "Salvando..." : "Confirmar e Salvar"}
            </button>
            <button onClick={() => { setShowForm(false); setNewCode(""); }}
              className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground font-medium">Cancelar</button>
          </div>
        </div>
      )}

      {/* Wristband list */}
      <div className="space-y-2">
        {wristbands.map((wb) => (
          <div key={wb.id} className="rounded-2xl bg-card p-4 shadow-sm border border-border">
            {editingId === wb.id ? (
              <div className="space-y-3">
                <input type="text" value={editCode} onChange={(e) => setEditCode(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground" />
                <select value={editEmployeeId} onChange={(e) => setEditEmployeeId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground">
                  {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.fullName}</option>))}
                </select>
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} className="flex items-center gap-1 rounded-xl bg-success/10 text-success px-3 py-1.5 text-xs font-bold">
                    <Check className="h-3 w-3" /> Salvar
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1 rounded-xl bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <X className="h-3 w-3" /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Nfc className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-card-foreground font-mono">{wb.code}</p>
                  <p className="text-xs text-muted-foreground">{wb.employeeName}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      wb.wristbandRole === "admin" ? "bg-destructive/10 text-destructive" :
                      wb.wristbandRole === "parceiro" ? "bg-accent/20 text-accent-foreground" :
                      "bg-primary/10 text-primary"
                    }`}>
                      {wb.wristbandRole === "admin" ? "Administrador" : wb.wristbandRole === "parceiro" ? "Parceiro" : "Funcionário"}
                    </span>
                    {wb.userId && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <Check className="h-2.5 w-2.5" /> Vinculada
                      </span>
                    )}
                    {!wb.userId && (
                      <span className="inline-flex items-center text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Disponível
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => copySignupLink(wb.code)} title="Copiar link de cadastro"
                    className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition">
                    <Link2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleStartEdit(wb)} title="Editar"
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(wb.id)} title="Excluir"
                    className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPulseiras;
