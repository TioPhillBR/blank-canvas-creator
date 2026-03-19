import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Pencil, Save, X, Building2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Department {
  id: string;
  name: string;
  description: string | null;
}

interface Position {
  id: string;
  name: string;
  department_id: string | null;
  description: string | null;
}

const AdminCargos = () => {
  return (
    <div className="max-w-4xl space-y-4">
      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-auto">
          <TabsTrigger value="departments" className="text-xs py-2 flex flex-col items-center gap-1">
            <Building2 className="h-3.5 w-3.5" /><span>Departamentos</span>
          </TabsTrigger>
          <TabsTrigger value="positions" className="text-xs py-2 flex flex-col items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" /><span>Cargos</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="departments"><DepartmentsTab /></TabsContent>
        <TabsContent value="positions"><PositionsTab /></TabsContent>
      </Tabs>
    </div>
  );
};

function DepartmentsTab() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const load = async () => {
    const { data } = await supabase.from("departments").select("*").order("name");
    setItems((data as Department[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("departments").insert({ name: name.trim(), description: desc.trim() || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Departamento criado!");
    setName(""); setDesc("");
    load();
  };

  const startEdit = (d: Department) => {
    setEditingId(d.id);
    setEditName(d.name);
    setEditDesc(d.description ?? "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("departments").update({ name: editName.trim(), description: editDesc.trim() || null }).eq("id", editingId);
    if (error) { toast.error(error.message); return; }
    toast.success("Atualizado!"); setEditingId(null); load();
  };

  const remove = async (id: string) => {
    await supabase.from("departments").delete().eq("id", id);
    toast.success("Removido!"); load();
  };

  return (
    <div className="space-y-3 mt-3">
      <div className="bg-card rounded-2xl p-4 border border-border space-y-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do departamento" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (opcional)" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <button onClick={add} className="w-full flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" /> :
        items.map((d) =>
          editingId === d.id ? (
            <div key={d.id} className="bg-card rounded-xl p-3 border border-primary space-y-2">
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
              <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Descrição" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground"><Save className="h-4 w-4" /> Salvar</button>
                <button onClick={() => setEditingId(null)} className="px-4 rounded-xl border border-border py-2 text-sm"><X className="h-4 w-4" /></button>
              </div>
            </div>
          ) : (
            <div key={d.id} className="flex items-center gap-2 bg-card rounded-xl p-3 border border-border">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{d.name}</p>
                {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
              </div>
              <button onClick={() => startEdit(d)} className="p-1 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
              <button onClick={() => remove(d.id)} className="text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
            </div>
          )
        )}
    </div>
  );
}

function PositionsTab() {
  const [items, setItems] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [deptId, setDeptId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDeptId, setEditDeptId] = useState("");

  const load = async () => {
    const [posRes, deptRes] = await Promise.all([
      supabase.from("positions").select("*").order("name"),
      supabase.from("departments").select("*").order("name"),
    ]);
    setItems((posRes.data as Position[]) ?? []);
    setDepartments((deptRes.data as Department[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const getDeptName = (id: string | null) => departments.find((d) => d.id === id)?.name ?? "—";

  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("positions").insert({ name: name.trim(), description: desc.trim() || null, department_id: deptId || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Cargo criado!");
    setName(""); setDesc(""); setDeptId("");
    load();
  };

  const startEdit = (p: Position) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDesc(p.description ?? "");
    setEditDeptId(p.department_id ?? "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("positions").update({ name: editName.trim(), description: editDesc.trim() || null, department_id: editDeptId || null }).eq("id", editingId);
    if (error) { toast.error(error.message); return; }
    toast.success("Atualizado!"); setEditingId(null); load();
  };

  const remove = async (id: string) => {
    await supabase.from("positions").delete().eq("id", id);
    toast.success("Removido!"); load();
  };

  return (
    <div className="space-y-3 mt-3">
      <div className="bg-card rounded-2xl p-4 border border-border space-y-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do cargo" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (opcional)" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <select value={deptId} onChange={(e) => setDeptId(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
          <option value="">Sem departamento</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button onClick={add} className="w-full flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" /> :
        items.map((p) =>
          editingId === p.id ? (
            <div key={p.id} className="bg-card rounded-xl p-3 border border-primary space-y-2">
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
              <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Descrição" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
              <select value={editDeptId} onChange={(e) => setEditDeptId(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                <option value="">Sem departamento</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground"><Save className="h-4 w-4" /> Salvar</button>
                <button onClick={() => setEditingId(null)} className="px-4 rounded-xl border border-border py-2 text-sm"><X className="h-4 w-4" /></button>
              </div>
            </div>
          ) : (
            <div key={p.id} className="flex items-center gap-2 bg-card rounded-xl p-3 border border-border">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{getDeptName(p.department_id)}{p.description ? ` • ${p.description}` : ""}</p>
              </div>
              <button onClick={() => startEdit(p)} className="p-1 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
              <button onClick={() => remove(p.id)} className="text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
            </div>
          )
        )}
    </div>
  );
}

export default AdminCargos;
