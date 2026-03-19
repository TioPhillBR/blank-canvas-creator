import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Heart, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

interface EmployeeHealth {
  id: string;
  full_name: string;
  photo_url: string | null;
  blood_type: string;
  gender: string | null;
  birth_date: string | null;
  pre_existing_conditions: string[] | null;
  medications: string[] | null;
  allergies: string[] | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
}

const AdminSaude = () => {
  const [employees, setEmployees] = useState<EmployeeHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<EmployeeHealth>>({});
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("id, full_name, photo_url, blood_type, gender, birth_date, pre_existing_conditions, medications, allergies, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship")
      .order("full_name");
    if (error) { toast.error(error.message); return; }
    setEmployees((data as EmployeeHealth[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = employees.filter((e) =>
    e.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (emp: EmployeeHealth) => {
    setEditingId(emp.id);
    setForm({
      blood_type: emp.blood_type,
      pre_existing_conditions: emp.pre_existing_conditions,
      medications: emp.medications,
      allergies: emp.allergies,
      emergency_contact_name: emp.emergency_contact_name,
      emergency_contact_phone: emp.emergency_contact_phone,
      emergency_contact_relationship: emp.emergency_contact_relationship,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase.from("employees").update({
      blood_type: form.blood_type,
      pre_existing_conditions: form.pre_existing_conditions ?? [],
      medications: form.medications ?? [],
      allergies: form.allergies ?? [],
      emergency_contact_name: form.emergency_contact_name,
      emergency_contact_phone: form.emergency_contact_phone,
      emergency_contact_relationship: form.emergency_contact_relationship,
    }).eq("id", editingId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Dados de saúde atualizados!");
    setEditingId(null);
    load();
  };

  const selected = selectedId ? employees.find((e) => e.id === selectedId) : null;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar funcionário..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((emp) => (
          <div
            key={emp.id}
            className={`rounded-xl border p-4 cursor-pointer transition hover:shadow-md ${
              selectedId === emp.id ? "border-primary bg-primary/5" : "border-border bg-card"
            }`}
            onClick={() => setSelectedId(selectedId === emp.id ? null : emp.id)}
          >
            <div className="flex items-center gap-3">
              {emp.photo_url ? (
                <img src={emp.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{emp.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  Sangue: {emp.blood_type} • {emp.gender ?? "—"} • {emp.birth_date ? new Date(emp.birth_date + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); startEdit(emp); setSelectedId(emp.id); }}
                className="p-2 rounded-lg hover:bg-muted transition"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Detail */}
            {selectedId === emp.id && editingId !== emp.id && (
              <div className="mt-3 pt-3 border-t border-border space-y-2 text-sm">
                <InfoRow label="Condições Pré-existentes" value={(emp.pre_existing_conditions ?? []).join(", ") || "Nenhuma"} />
                <InfoRow label="Medicamentos" value={(emp.medications ?? []).join(", ") || "Nenhum"} />
                <InfoRow label="Alergias" value={(emp.allergies ?? []).join(", ") || "Nenhuma"} />
                <InfoRow label="Contato de Emergência" value={`${emp.emergency_contact_name} (${emp.emergency_contact_relationship}) — ${emp.emergency_contact_phone}`} />
              </div>
            )}

            {/* Edit form */}
            {editingId === emp.id && (
              <div className="mt-3 pt-3 border-t border-border space-y-2" onClick={(e) => e.stopPropagation()}>
                <label className="text-xs font-semibold text-muted-foreground">Tipo Sanguíneo</label>
                <select value={form.blood_type ?? ""} onChange={(e) => setForm({ ...form, blood_type: e.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <label className="text-xs font-semibold text-muted-foreground">Condições Pré-existentes (separar por vírgula)</label>
                <input value={(form.pre_existing_conditions ?? []).join(", ")} onChange={(e) => setForm({ ...form, pre_existing_conditions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
                <label className="text-xs font-semibold text-muted-foreground">Medicamentos</label>
                <input value={(form.medications ?? []).join(", ")} onChange={(e) => setForm({ ...form, medications: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
                <label className="text-xs font-semibold text-muted-foreground">Alergias</label>
                <input value={(form.allergies ?? []).join(", ")} onChange={(e) => setForm({ ...form, allergies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
                <label className="text-xs font-semibold text-muted-foreground">Contato de Emergência</label>
                <div className="grid grid-cols-3 gap-2">
                  <input value={form.emergency_contact_name ?? ""} onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} placeholder="Nome" className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
                  <input value={form.emergency_contact_phone ?? ""} onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })} placeholder="Telefone" className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
                  <input value={form.emergency_contact_relationship ?? ""} onChange={(e) => setForm({ ...form, emergency_contact_relationship: e.target.value })} placeholder="Parentesco" className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveEdit} disabled={saving} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 rounded-xl border border-border py-2 text-sm text-muted-foreground hover:bg-muted">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhum funcionário encontrado.</p>}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="text-xs font-semibold text-muted-foreground">{label}: </span>
    <span className="text-foreground">{value}</span>
  </div>
);

export default AdminSaude;
