import { useState, useEffect } from "react";
import { useSupabaseDatabase } from "@/hooks/useSupabaseDatabase";
import type { Employee, Wristband } from "@/data/types";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Plus, Pencil, Trash2, Search, X, Save, Upload, Link2, Copy, Check,
} from "lucide-react";
import { toast } from "sonner";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const emptyEmployee: Omit<Employee, "id"> = {
  fullName: "",
  
  cpf: "",
  role: "",
  department: "",
  phone: "",
  email: "",
  socialMedia: {},
  bloodType: "O+",
  preExistingConditions: [],
  medications: [],
  allergies: [],
  emergencyContact: { name: "", phone: "", relationship: "" },
};

const AdminUsuarios = () => {
  const { fetchEmployees, fetchWristbands, insertEmployee, updateEmployee, deleteEmployee } = useSupabaseDatabase();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [wristbands, setWristbands] = useState<Wristband[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyEmployee);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Detail view
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Comma-separated field helpers
  const [conditionsText, setConditionsText] = useState("");
  const [medicationsText, setMedicationsText] = useState("");
  const [allergiesText, setAllergiesText] = useState("");

  const loadData = async () => {
    try {
      const [emps, wbs] = await Promise.all([fetchEmployees(), fetchWristbands()]);
      // Fetch parceiro wristband employee_ids to filter them out
      const { data: parceiroWbs } = await supabase
        .from("wristbands")
        .select("employee_id")
        .eq("role", "parceiro");
      const parceiroEmpIds = new Set((parceiroWbs ?? []).map(w => w.employee_id).filter(Boolean));
      setEmployees(emps.filter(e => !parceiroEmpIds.has(e.id)));
      setWristbands(wbs);
    } catch {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [fetchEmployees, fetchWristbands]);

  const getWristbandForEmployee = (empId: string) =>
    wristbands.find((w) => w.employeeId === empId);

  const getWristbandUrl = (code: string) =>
    `${window.location.origin}/pulseira/${code}`;

  const copyToClipboard = async (text: string, empId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(empId);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Photo upload
  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("employee-photos").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) { toast.error("Erro no upload: " + error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("employee-photos").getPublicUrl(path);
    setForm(f => ({ ...f, photoUrl: data.publicUrl }));
    toast.success("Foto enviada!");
    setUploading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyEmployee);
    setConditionsText("");
    setMedicationsText("");
    setAllergiesText("");
    setShowForm(true);
    setSelectedId(null);
  };

  const openEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setForm({
      fullName: emp.fullName,
      photoUrl: emp.photoUrl,
      
      cpf: emp.cpf,
      role: emp.role,
      department: emp.department,
      phone: emp.phone,
      email: emp.email,
      socialMedia: emp.socialMedia,
      bloodType: emp.bloodType,
      preExistingConditions: emp.preExistingConditions,
      medications: emp.medications,
      allergies: emp.allergies,
      emergencyContact: emp.emergencyContact,
    });
    setConditionsText(emp.preExistingConditions.join(", "));
    setMedicationsText(emp.medications.join(", "));
    setAllergiesText(emp.allergies.join(", "));
    setShowForm(true);
    setSelectedId(null);
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.cpf.trim() || !form.email.trim()) {
      toast.error("Preencha os campos obrigatórios: Nome, CPF e Email.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        preExistingConditions: conditionsText.split(",").map(s => s.trim()).filter(Boolean),
        medications: medicationsText.split(",").map(s => s.trim()).filter(Boolean),
        allergies: allergiesText.split(",").map(s => s.trim()).filter(Boolean),
      };
      if (editingId) {
        await updateEmployee(editingId, payload);
        toast.success("Funcionário atualizado!");
      } else {
        await insertEmployee(payload);
        toast.success("Funcionário criado!");
      }
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteEmployee(id);
      toast.success("Funcionário removido!");
      setDeletingId(null);
      setSelectedId(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.cpf.includes(search)
  );

  const selectedEmployee = selectedId ? employees.find(e => e.id === selectedId) : null;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground flex-1">{filtered.length} funcionário{filtered.length !== 1 ? "s" : ""}</p>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20 active:scale-[0.97] transition">
          <Plus className="h-4 w-4" /> Novo Funcionário
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" placeholder="Buscar por nome, email ou CPF..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground" />
      </div>

      {/* Detail view */}
      {selectedEmployee && !showForm && (
        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-card-foreground">Detalhes do Funcionário</h2>
            <button onClick={() => setSelectedId(null)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-border shrink-0">
              {selectedEmployee.photoUrl ? (
                <img src={selectedEmployee.photoUrl} alt={selectedEmployee.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg">
                  {selectedEmployee.fullName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="text-base font-bold text-card-foreground">{selectedEmployee.fullName}</p>
              <p className="text-xs text-muted-foreground">{selectedEmployee.role} · {selectedEmployee.department}</p>
              <p className="text-xs text-muted-foreground">{selectedEmployee.email}</p>
            </div>
          </div>

          {/* Wristband link */}
          {(() => {
            const wb = getWristbandForEmployee(selectedEmployee.id);
            if (!wb) return (
              <div className="flex items-center gap-2 rounded-xl bg-muted p-3">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">Nenhuma pulseira vinculada</p>
              </div>
            );
            const url = getWristbandUrl(wb.code);
            return (
              <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/20 p-3">
                <Link2 className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pulseira vinculada</p>
                  <p className="text-xs text-primary font-mono truncate">{url}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(url, selectedEmployee.id)}
                  className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition shrink-0"
                  title="Copiar link"
                >
                  {copiedId === selectedEmployee.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            );
          })()}

          <div className="flex gap-2">
            <button onClick={() => openEdit(selectedEmployee)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 text-primary py-2 text-sm font-semibold hover:bg-primary/20 transition">
              <Pencil className="h-3.5 w-3.5" /> Editar
            </button>
            <button onClick={() => setDeletingId(selectedEmployee.id)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 text-destructive px-4 py-2 text-sm font-semibold hover:bg-destructive/20 transition">
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-card-foreground">{editingId ? "Editar Funcionário" : "Novo Funcionário"}</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Photo upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Foto de perfil</label>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-border shrink-0">
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground text-xs">Foto</div>
                )}
              </div>
              <label className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer transition ${uploading ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Enviando..." : "Upload"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading}
                  onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }} />
              </label>
              {form.photoUrl && (
                <button onClick={() => setForm(f => ({ ...f, photoUrl: undefined }))}
                  className="text-xs text-destructive font-semibold">Remover</button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nome completo *" value={form.fullName} onChange={(v) => setForm(f => ({ ...f, fullName: v }))} span={2} />
            <FormField label="CPF *" value={form.cpf} onChange={(v) => setForm(f => ({ ...f, cpf: v }))} />
            
            <FormField label="Email *" value={form.email} onChange={(v) => setForm(f => ({ ...f, email: v }))} span={2} type="email" />
            <FormField label="Telefone" value={form.phone} onChange={(v) => setForm(f => ({ ...f, phone: v }))} />
            <FormField label="Cargo" value={form.role} onChange={(v) => setForm(f => ({ ...f, role: v }))} />
            <FormField label="Departamento" value={form.department} onChange={(v) => setForm(f => ({ ...f, department: v }))} />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Tipo Sanguíneo</label>
              <select value={form.bloodType} onChange={(e) => setForm(f => ({ ...f, bloodType: e.target.value }))}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground">
                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>
            <FormField label="LinkedIn" value={form.socialMedia?.linkedin ?? ""} onChange={(v) => setForm(f => ({ ...f, socialMedia: { ...f.socialMedia, linkedin: v } }))} />
            <FormField label="Instagram" value={form.socialMedia?.instagram ?? ""} onChange={(v) => setForm(f => ({ ...f, socialMedia: { ...f.socialMedia, instagram: v } }))} />
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">Saúde</h3>
          <div className="space-y-2">
            <FormField label="Condições pré-existentes (separar por vírgula)" value={conditionsText} onChange={setConditionsText} span={2} />
            <FormField label="Medicamentos (separar por vírgula)" value={medicationsText} onChange={setMedicationsText} span={2} />
            <FormField label="Alergias (separar por vírgula)" value={allergiesText} onChange={setAllergiesText} span={2} />
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">Contato de Emergência</h3>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nome" value={form.emergencyContact.name} onChange={(v) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, name: v } }))} span={2} />
            <FormField label="Telefone" value={form.emergencyContact.phone} onChange={(v) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, phone: v } }))} />
            <FormField label="Parentesco" value={form.emergencyContact.relationship} onChange={(v) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, relationship: v } }))} />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50 active:scale-[0.97] transition">
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}
              className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground font-medium">Cancelar</button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deletingId && (
        <div className="rounded-2xl bg-destructive/10 p-5 border border-destructive/30 space-y-3 animate-in fade-in">
          <p className="text-sm font-bold text-destructive">Confirmar exclusão?</p>
          <p className="text-xs text-muted-foreground">
            Esta ação removerá permanentemente o funcionário <strong>{employees.find(e => e.id === deletingId)?.fullName}</strong>.
          </p>
          <div className="flex gap-2">
            <button onClick={() => handleDelete(deletingId)} disabled={deleting}
              className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground disabled:opacity-50">
              {deleting ? "Removendo..." : "Sim, remover"}
            </button>
            <button onClick={() => setDeletingId(null)}
              className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground font-medium">Cancelar</button>
          </div>
        </div>
      )}

      {/* Employee list */}
      <div className="space-y-2">
        {filtered.map((emp) => {
          const wb = getWristbandForEmployee(emp.id);
          return (
            <button key={emp.id} onClick={() => setSelectedId(emp.id)}
              className={`flex items-center gap-3 w-full rounded-2xl bg-card p-4 shadow-sm border transition text-left active:scale-[0.98] ${selectedId === emp.id ? "border-primary ring-1 ring-primary/20" : "border-border hover:shadow-md"}`}>
              <div className="h-11 w-11 rounded-full overflow-hidden shadow-sm border-2 border-border flex-shrink-0">
                {emp.photoUrl ? <img src={emp.photoUrl} alt={emp.fullName} className="h-full w-full object-cover" /> :
                  <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground font-bold text-sm">{emp.fullName.charAt(0)}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-card-foreground truncate">{emp.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                <p className="text-[10px] text-muted-foreground">{emp.role} · {emp.department}</p>
              </div>
              {wb && (
                <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-lg shrink-0">
                  NFC
                </span>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum funcionário encontrado.</p>
        )}
      </div>
    </div>
  );
};

// Reusable form field
function FormField({ label, value, onChange, type = "text", span }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; span?: number;
}) {
  return (
    <div className={`space-y-1 ${span === 2 ? "col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
    </div>
  );
}

export default AdminUsuarios;
