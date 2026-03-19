import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Pencil, Save, X, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface Section {
  id: string;
  title: string;
  content: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

const ICON_OPTIONS = [
  "Building2", "Target", "Eye", "Heart", "Phone", "Mail", "MapPin",
  "Shield", "Star", "Award", "Users", "Globe", "Briefcase", "BookOpen",
];

const AdminInstitucional = () => {
  const [items, setItems] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [icon, setIcon] = useState("Building2");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editIcon, setEditIcon] = useState("Building2");

  const load = async () => {
    const { data } = await supabase.from("institutional_sections").select("*").order("sort_order");
    setItems((data as Section[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!title.trim() || !content.trim()) return;
    const { error } = await supabase.from("institutional_sections").insert({
      title: title.trim(), content: content.trim(), icon, sort_order: items.length,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Seção adicionada!");
    setTitle(""); setContent(""); setIcon("Building2");
    load();
  };

  const startEdit = (s: Section) => {
    setEditingId(s.id);
    setEditTitle(s.title);
    setEditContent(s.content);
    setEditIcon(s.icon ?? "Building2");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("institutional_sections").update({
      title: editTitle.trim(), content: editContent.trim(), icon: editIcon,
    }).eq("id", editingId);
    if (error) { toast.error(error.message); return; }
    toast.success("Atualizado!"); setEditingId(null); load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("institutional_sections").update({ is_active: !current }).eq("id", id);
    load();
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;
    const a = items[index], b = items[swapIndex];
    await Promise.all([
      supabase.from("institutional_sections").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("institutional_sections").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("institutional_sections").delete().eq("id", id);
    toast.success("Removido!"); load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl space-y-4">
      {/* Add form */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da seção" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Conteúdo (use '- ' no início da linha para criar listas)" rows={4} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" />
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Ícone</label>
          <select value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
            {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <button onClick={add} className="w-full flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> Adicionar Seção
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {items.map((s, i) =>
          editingId === s.id ? (
            <div key={s.id} className="bg-card rounded-xl p-4 border border-primary space-y-2">
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Ícone</label>
                <select value={editIcon} onChange={(e) => setEditIcon(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground"><Save className="h-4 w-4" /> Salvar</button>
                <button onClick={() => setEditingId(null)} className="px-4 rounded-xl border border-border py-2 text-sm"><X className="h-4 w-4" /></button>
              </div>
            </div>
          ) : (
            <div key={s.id} className={`rounded-xl border p-4 ${s.is_active ? "bg-card border-border" : "bg-muted/50 border-border opacity-60"}`}>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{s.icon ?? "Building2"}</span>
                    <p className="text-sm font-bold text-foreground">{s.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{s.content}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveOrder(i, "up")} disabled={i === 0} className="p-1 rounded-lg hover:bg-muted disabled:opacity-30"><ArrowUp className="h-4 w-4 text-muted-foreground" /></button>
                  <button onClick={() => moveOrder(i, "down")} disabled={i === items.length - 1} className="p-1 rounded-lg hover:bg-muted disabled:opacity-30"><ArrowDown className="h-4 w-4 text-muted-foreground" /></button>
                  <button onClick={() => toggleActive(s.id, s.is_active)} className="p-1 rounded-lg hover:bg-muted">
                    {s.is_active ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => startEdit(s)} className="p-1 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
                  <button onClick={() => remove(s.id)} className="p-1 rounded-lg hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              </div>
            </div>
          )
        )}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhuma seção institucional cadastrada.</p>}
      </div>

      <p className="text-xs text-muted-foreground">
        As seções ativas serão exibidas na página Institucional. Use "- " no início de cada linha para criar listas com marcadores.
      </p>
    </div>
  );
};

export default AdminInstitucional;
