import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Plus, Trash2, Quote, Briefcase, Calendar, Newspaper, Image } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---- Types ----
interface DailyQuote { id: string; quote: string; author: string | null; date: string; }
interface Opportunity { id: string; title: string; description: string; location: string | null; department: string | null; is_active: boolean; }
interface Event { id: string; title: string; description: string; event_date: string; location: string | null; image_url: string | null; is_active: boolean; }
interface NewsItem { id: string; title: string; content: string; image_url: string | null; is_published: boolean; published_at: string | null; }
interface Banner { id: string; title: string | null; image_url: string; link_url: string | null; sort_order: number; is_active: boolean; }

const AdminConteudo = () => {
  const { role } = useAuth();

  if (role !== "admin") return <p className="p-8 text-center text-muted-foreground">Acesso negado</p>;

  return (
    <div className="max-w-4xl space-y-4">

      <Tabs defaultValue="quotes" className="w-full">
        <TabsList className="w-full grid grid-cols-5 h-auto">
          <TabsTrigger value="quotes" className="text-xs py-2 flex flex-col items-center gap-1"><Quote className="h-3.5 w-3.5" /><span>Frase do Dia</span></TabsTrigger>
          <TabsTrigger value="opportunities" className="text-xs py-2 flex flex-col items-center gap-1"><Briefcase className="h-3.5 w-3.5" /><span>Vagas</span></TabsTrigger>
          <TabsTrigger value="events" className="text-xs py-2 flex flex-col items-center gap-1"><Calendar className="h-3.5 w-3.5" /><span>Eventos</span></TabsTrigger>
          <TabsTrigger value="news" className="text-xs py-2 flex flex-col items-center gap-1"><Newspaper className="h-3.5 w-3.5" /><span>Notícias</span></TabsTrigger>
          <TabsTrigger value="banners" className="text-xs py-2 flex flex-col items-center gap-1"><Image className="h-3.5 w-3.5" /><span>Banners</span></TabsTrigger>
        </TabsList>

        <TabsContent value="quotes"><QuotesTab /></TabsContent>
        <TabsContent value="opportunities"><OpportunitiesTab /></TabsContent>
        <TabsContent value="events"><EventsTab /></TabsContent>
        <TabsContent value="news"><NewsTab /></TabsContent>
        <TabsContent value="banners"><BannersTab /></TabsContent>
      </Tabs>
    </div>
  );
};

// =============== QUOTES ===============
function QuotesTab() {
  const [items, setItems] = useState<DailyQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const load = async () => {
    const { data } = await supabase.from("daily_quotes").select("*").order("date", { ascending: false }).limit(30);
    setItems((data as DailyQuote[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!quote.trim()) return;
    const { error } = await supabase.from("daily_quotes").insert({ quote: quote.trim(), author: author.trim() || null, date });
    if (error) { toast.error(error.message); return; }
    toast.success("Frase adicionada!");
    setQuote(""); setAuthor("");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("daily_quotes").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-3 mt-3">
      <div className="bg-card rounded-2xl p-4 border border-border space-y-2">
        <input value={quote} onChange={e => setQuote(e.target.value)} placeholder="Frase do dia" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Autor (opcional)" className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button onClick={add} className="w-full flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" /> :
        items.map(i => (
          <div key={i.id} className="flex items-start gap-2 bg-card rounded-xl p-3 border border-border">
            <div className="flex-1">
              <p className="text-sm text-foreground">"{i.quote}"</p>
              {i.author && <p className="text-xs text-muted-foreground mt-0.5">— {i.author}</p>}
              <p className="text-[10px] text-muted-foreground">{i.date}</p>
            </div>
            <button onClick={() => remove(i.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
    </div>
  );
}

// =============== OPPORTUNITIES ===============
function OpportunitiesTab() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loc, setLoc] = useState("");
  const [dept, setDept] = useState("");

  const load = async () => {
    const { data } = await supabase.from("opportunities").select("*").order("created_at", { ascending: false });
    setItems((data as Opportunity[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!title.trim() || !desc.trim()) return;
    const { error } = await supabase.from("opportunities").insert({ title: title.trim(), description: desc.trim(), location: loc.trim() || null, department: dept.trim() || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Vaga adicionada!");
    setTitle(""); setDesc(""); setLoc(""); setDept("");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("opportunities").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-3 mt-3">
      <div className="bg-card rounded-2xl p-4 border border-border space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da vaga" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descrição" rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" />
        <div className="flex gap-2">
          <input value={dept} onChange={e => setDept(e.target.value)} placeholder="Departamento" className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="Local" className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button onClick={add} className="w-full flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" /> :
        items.map(i => (
          <div key={i.id} className="flex items-start gap-2 bg-card rounded-xl p-3 border border-border">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{i.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{i.description}</p>
            </div>
            <button onClick={() => remove(i.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
    </div>
  );
}

// =============== EVENTS ===============
function EventsTab() {
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loc, setLoc] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const load = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    setItems((data as Event[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!title.trim() || !desc.trim() || !eventDate) return;
    const { error } = await supabase.from("events").insert({
      title: title.trim(), description: desc.trim(), event_date: eventDate,
      location: loc.trim() || null, image_url: imageUrl.trim() || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Evento adicionado!");
    setTitle(""); setDesc(""); setEventDate(""); setLoc(""); setImageUrl("");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-3 mt-3">
      <div className="bg-card rounded-2xl p-4 border border-border space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do evento" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descrição" rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" />
        <div className="flex gap-2">
          <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          <input value={loc} onChange={e => setLoc(e.target.value)} placeholder="Local" className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="URL da imagem (opcional)" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <button onClick={add} className="w-full flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" /> :
        items.map(i => (
          <div key={i.id} className="flex items-start gap-2 bg-card rounded-xl p-3 border border-border">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{i.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(i.event_date).toLocaleDateString("pt-BR")}</p>
            </div>
            <button onClick={() => remove(i.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
    </div>
  );
}

// =============== NEWS ===============
function NewsTab() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publishAt, setPublishAt] = useState("");

  const load = async () => {
    const { data } = await supabase.from("news").select("*").order("published_at", { ascending: false });
    setItems((data as NewsItem[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!title.trim() || !content.trim()) return;
    const { error } = await supabase.from("news").insert({
      title: title.trim(), content: content.trim(),
      image_url: imageUrl.trim() || null,
      published_at: publishAt || new Date().toISOString(),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Notícia adicionada!");
    setTitle(""); setContent(""); setImageUrl(""); setPublishAt("");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("news").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-3 mt-3">
      <div className="bg-card rounded-2xl p-4 border border-border space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da notícia" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Conteúdo" rows={4} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" />
        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="URL da imagem (opcional)" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Agendar publicação (opcional)</label>
          <input type="datetime-local" value={publishAt} onChange={e => setPublishAt(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button onClick={add} className="w-full flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" /> :
        items.map(i => (
          <div key={i.id} className="flex items-start gap-2 bg-card rounded-xl p-3 border border-border">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{i.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{i.content}</p>
              {i.published_at && <p className="text-[10px] text-primary mt-0.5">📅 {new Date(i.published_at).toLocaleDateString("pt-BR")} às {new Date(i.published_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>}
            </div>
            <button onClick={() => remove(i.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
    </div>
  );
}

// =============== BANNERS ===============
const INTERNAL_PAGES = [
  { value: "", label: "Nenhum (sem link)" },
  { value: "/saude", label: "Saúde" },
  { value: "/ponto", label: "Ponto" },
  { value: "/escala", label: "Escala" },
  { value: "/notificacoes", label: "Notificações" },
  { value: "/perfil", label: "Perfil" },
  { value: "/institucional", label: "Institucional" },
];

function BannerLinkField({ linkType, setLinkType, linkUrl, setLinkUrl }: {
  linkType: "none" | "internal" | "external";
  setLinkType: (v: "none" | "internal" | "external") => void;
  linkUrl: string;
  setLinkUrl: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground">Tipo de link</label>
      <div className="flex gap-1.5">
        {(["none", "internal", "external"] as const).map((t) => (
          <button key={t} type="button" onClick={() => { setLinkType(t); if (t === "none") setLinkUrl(""); }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${linkType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {t === "none" ? "Nenhum" : t === "internal" ? "Página interna" : "Link externo"}
          </button>
        ))}
      </div>
      {linkType === "internal" && (
        <select value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
          {INTERNAL_PAGES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      )}
      {linkType === "external" && (
        <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://exemplo.com" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
      )}
    </div>
  );
}

function getLinkType(url: string | null): "none" | "internal" | "external" {
  if (!url) return "none";
  if (url.startsWith("/")) return "internal";
  return "external";
}

function BannersTab() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkType, setLinkType] = useState<"none" | "internal" | "external">("none");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editLinkType, setEditLinkType] = useState<"none" | "internal" | "external">("none");

  const load = async () => {
    const { data } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
    setItems((data as Banner[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("banners").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) { toast.error("Erro no upload: " + error.message); return null; }
    const { data } = supabase.storage.from("banners").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (!url) { setUploading(false); return; }
    const { error } = await supabase.from("banners").insert({
      title: title.trim() || null, image_url: url,
      link_url: linkUrl.trim() || null, sort_order: items.length,
    });
    if (error) { toast.error(error.message); setUploading(false); return; }
    toast.success("Banner adicionado!");
    setTitle(""); setLinkUrl(""); setLinkType("none");
    e.target.value = "";
    setUploading(false);
    load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("banners").update({ is_active: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;
    const a = items[index];
    const b = items[swapIndex];
    await Promise.all([
      supabase.from("banners").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("banners").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    load();
  };

  const startEdit = (item: Banner) => {
    setEditingId(item.id);
    setEditTitle(item.title ?? "");
    setEditLinkUrl(item.link_url ?? "");
    setEditLinkType(getLinkType(item.link_url));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("banners").update({
      title: editTitle.trim() || null,
      link_url: editLinkUrl.trim() || null,
    }).eq("id", editingId);
    if (error) { toast.error(error.message); return; }
    toast.success("Banner atualizado!");
    setEditingId(null);
    load();
  };

  const replaceImage = async (id: string, file: File) => {
    setUploading(true);
    const url = await uploadImage(file);
    if (!url) { setUploading(false); return; }
    const { error } = await supabase.from("banners").update({ image_url: url }).eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Imagem substituída!");
    setUploading(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("banners").delete().eq("id", id);
    toast.success("Banner removido!");
    load();
  };

  return (
    <div className="space-y-3 mt-3">
      {/* Add form */}
      <div className="bg-card rounded-2xl p-4 border border-border space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título (opcional)" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <BannerLinkField linkType={linkType} setLinkType={setLinkType} linkUrl={linkUrl} setLinkUrl={setLinkUrl} />
        <label className={`w-full flex items-center justify-center gap-1 rounded-xl py-2 text-sm font-bold cursor-pointer transition ${uploading ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {uploading ? "Enviando..." : "Selecionar imagem e adicionar"}
          <input type="file" accept="image/*" onChange={handleAdd} className="hidden" disabled={uploading} />
        </label>
      </div>

      {/* List */}
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" /> :
        items.length === 0 ? <p className="text-xs text-muted-foreground text-center py-4">Nenhum banner cadastrado.</p> :
        items.map((item, idx) => (
          <div key={item.id} className="bg-card rounded-xl p-3 border border-border space-y-2">
            <div className="flex items-start gap-3">
              <img src={item.image_url} alt={item.title ?? "Banner"} className="w-24 h-14 rounded-lg object-cover border border-border shrink-0" />
              <div className="flex-1 min-w-0">
                {editingId === item.id ? (
                  <div className="space-y-1.5">
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Título" className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs" />
                    <BannerLinkField linkType={editLinkType} setLinkType={setEditLinkType} linkUrl={editLinkUrl} setLinkUrl={setEditLinkUrl} />
                    <div className="flex gap-1.5">
                      <button onClick={saveEdit} className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Salvar</button>
                      <button onClick={() => setEditingId(null)} className="rounded-lg bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-card-foreground truncate">{item.title || "Sem título"}</p>
                    {item.link_url && <p className="text-[10px] text-primary truncate">{item.link_url}</p>}
                    <p className={`text-[10px] font-semibold mt-0.5 ${item.is_active ? "text-success" : "text-muted-foreground"}`}>
                      {item.is_active ? "● Ativo" : "○ Inativo"}
                    </p>
                  </>
                )}
              </div>
              {editingId !== item.id && (
                <button onClick={() => remove(item.id)} className="text-destructive shrink-0"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>

            {editingId !== item.id && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button onClick={() => startEdit(item)} className="rounded-lg bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground hover:bg-muted/80 transition">Editar</button>
                <button onClick={() => toggleActive(item.id, item.is_active)} className="rounded-lg bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground hover:bg-muted/80 transition">
                  {item.is_active ? "Desativar" : "Ativar"}
                </button>
                <label className="rounded-lg bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground hover:bg-muted/80 transition cursor-pointer">
                  Trocar imagem
                  <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) replaceImage(item.id, e.target.files[0]); }} className="hidden" />
                </label>
                {idx > 0 && <button onClick={() => moveOrder(idx, "up")} className="rounded-lg bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground hover:bg-muted/80 transition">↑</button>}
                {idx < items.length - 1 && <button onClick={() => moveOrder(idx, "down")} className="rounded-lg bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground hover:bg-muted/80 transition">↓</button>}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

export default AdminConteudo;
