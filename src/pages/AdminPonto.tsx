import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Trash2, Pencil, Save, X, Check, MapPin, FileSpreadsheet, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";

interface ClockRow {
  id: string;
  employee_id: string;
  date_time: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
  edited: boolean;
}

interface EmpOption {
  id: string;
  full_name: string;
}

const TYPE_LABELS: Record<string, string> = {
  entrada: "Entrada",
  "saída": "Saída",
  "saída-almoço": "Saída Almoço",
  "retorno-almoço": "Retorno Almoço",
};

const AdminPonto = () => {
  const [employees, setEmployees] = useState<EmpOption[]>([]);
  const [records, setRecords] = useState<ClockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [filterEmpId, setFilterEmpId] = useState("");
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDateTime, setEditDateTime] = useState("");
  const [editType, setEditType] = useState("");
  const [saving, setSaving] = useState(false);

  // Add record state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addEmpId, setAddEmpId] = useState("");
  const [addDateTime, setAddDateTime] = useState("");
  const [addType, setAddType] = useState("saída-almoço");

  const load = async () => {
    setLoading(true);
    const [empRes, recRes] = await Promise.all([
      supabase.from("employees").select("id, full_name").order("full_name"),
      supabase.from("clock_records").select("*").gte("date_time", `${filterMonth}-01T00:00:00`).lt("date_time", getNextMonth(filterMonth)).order("date_time", { ascending: false }),
    ]);
    setEmployees((empRes.data as EmpOption[]) ?? []);
    setRecords((recRes.data as ClockRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterMonth]);

  const getNextMonth = (ym: string) => {
    const [y, m] = ym.split("-").map(Number);
    const d = new Date(y, m, 1);
    return d.toISOString().slice(0, 10) + "T00:00:00";
  };

  const getEmpName = (id: string) => employees.find((e) => e.id === id)?.full_name ?? "—";

  const filteredRecords = records.filter((r) => {
    if (filterEmpId && r.employee_id !== filterEmpId) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedEmpIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedEmpIds.length === employees.length) setSelectedEmpIds([]);
    else setSelectedEmpIds(employees.map((e) => e.id));
  };

  const startEdit = (r: ClockRow) => {
    setEditingId(r.id);
    setEditDateTime(r.date_time.slice(0, 16));
    setEditType(r.type);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase.from("clock_records").update({
      date_time: new Date(editDateTime).toISOString(),
      type: editType as "entrada" | "saída" | "saída-almoço" | "retorno-almoço",
      edited: true,
    }).eq("id", editingId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Registro atualizado!");
    setEditingId(null);
    load();
  };

  const addRecord = async () => {
    if (!addEmpId || !addDateTime) { toast.error("Preencha todos os campos."); return; }
    setSaving(true);
    const { error } = await supabase.from("clock_records").insert({
      employee_id: addEmpId,
      date_time: new Date(addDateTime).toISOString(),
      type: addType as "entrada" | "saída" | "saída-almoço" | "retorno-almoço",
      edited: true,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Registro adicionado!");
    setShowAddForm(false);
    setAddEmpId("");
    setAddDateTime("");
    setAddType("saída-almoço");
    load();
  };

  const deleteRecord = async (id: string) => {
    await supabase.from("clock_records").delete().eq("id", id);
    toast.success("Registro removido!");
    load();
  };

  const getExportData = () => {
    const idsToExport = selectedEmpIds.length > 0 ? selectedEmpIds : employees.map((e) => e.id);
    const toExport = records.filter((r) => idsToExport.includes(r.employee_id));
    if (toExport.length === 0) { toast.error("Nenhum registro para exportar."); return null; }
    return toExport.map((r) => {
      const dt = new Date(r.date_time);
      return {
        Funcionário: getEmpName(r.employee_id),
        Data: dt.toLocaleDateString("pt-BR"),
        Hora: dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        Tipo: TYPE_LABELS[r.type] ?? r.type,
        Editado: r.edited ? "Sim" : "Não",
      };
    });
  };

  const exportCSV = () => {
    const data = getExportData();
    if (!data) return;
    const header = "Funcionário,Data,Hora,Tipo,Editado\n";
    const rows = data.map((r) => `"${r.Funcionário}","${r.Data}","${r.Hora}","${r.Tipo}","${r.Editado}"`).join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `folha-ponto-${filterMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  };

  const exportXLSX = () => {
    const data = getExportData();
    if (!data) return;
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 8 }, { wch: 18 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Folha de Ponto");
    XLSX.writeFile(wb, `folha-ponto-${filterMonth}.xlsx`);
    toast.success("XLSX exportado!");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-5xl space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm" />
        <select value={filterEmpId} onChange={(e) => setFilterEmpId(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm">
          <option value="">Todos os funcionários</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
        </select>
        <button onClick={() => setShowAddForm((v) => !v)} className="flex items-center gap-1 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
        <button onClick={exportCSV} className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground ml-auto">
          <Download className="h-4 w-4" /> CSV
        </button>
        <button onClick={exportXLSX} className="flex items-center gap-1 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">
          <FileSpreadsheet className="h-4 w-4" /> XLSX
        </button>
      </div>

      {/* Add record form */}
      {showAddForm && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Adicionar Registro de Ponto</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Funcionário</label>
              <select value={addEmpId} onChange={(e) => setAddEmpId(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm w-full">
                <option value="">Selecione...</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Data/Hora</label>
              <input type="datetime-local" value={addDateTime} onChange={(e) => setAddDateTime(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tipo</label>
              <select value={addType} onChange={(e) => setAddType(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <button onClick={addRecord} disabled={saving} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
              <Save className="h-4 w-4" /> Salvar
            </button>
            <button onClick={() => setShowAddForm(false)} className="p-2 rounded-lg hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Employee selection for export */}
      <div className="bg-card rounded-xl border border-border p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">Selecionar para exportação</span>
          <button onClick={selectAll} className="text-xs text-primary font-semibold">
            {selectedEmpIds.length === employees.length ? "Desmarcar todos" : "Selecionar todos"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {employees.map((e) => (
            <button
              key={e.id}
              onClick={() => toggleSelect(e.id)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                selectedEmpIds.includes(e.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {selectedEmpIds.includes(e.id) && <Check className="h-3 w-3" />}
              {e.full_name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Records table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Funcionário</th>
                <th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Data</th>
                <th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Hora</th>
                <th className="text-left px-4 py-2 text-xs font-bold text-muted-foreground">Tipo</th>
                <th className="text-center px-4 py-2 text-xs font-bold text-muted-foreground">Local</th>
                <th className="text-right px-4 py-2 text-xs font-bold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => {
                const dt = new Date(r.date_time);
                if (editingId === r.id) {
                  return (
                    <tr key={r.id} className="border-b border-border bg-primary/5">
                      <td className="px-4 py-2 text-foreground">{getEmpName(r.employee_id)}</td>
                      <td colSpan={2} className="px-4 py-2">
                        <input type="datetime-local" value={editDateTime} onChange={(e) => setEditDateTime(e.target.value)} className="rounded-lg border border-input bg-background px-2 py-1 text-sm" />
                      </td>
                      <td className="px-4 py-2">
                        <select value={editType} onChange={(e) => setEditType(e.target.value)} className="rounded-lg border border-input bg-background px-2 py-1 text-sm">
                          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                      <td colSpan={2} className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={saveEdit} disabled={saving} className="p-1 rounded-lg bg-primary text-primary-foreground"><Save className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 rounded-lg hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium text-foreground">{getEmpName(r.employee_id)}</td>
                    <td className="px-4 py-2 text-muted-foreground">{dt.toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-2 text-muted-foreground">{dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-2 text-foreground">
                      <span className="flex items-center gap-2">
                        {TYPE_LABELS[r.type] ?? r.type}
                        {r.edited && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Editado</Badge>}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {r.latitude && r.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          title={`${r.latitude.toFixed(6)}, ${r.longitude.toFixed(6)}`}
                        >
                          <MapPin className="h-3.5 w-3.5" /> Ver
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => startEdit(r)} className="p-1 rounded-lg hover:bg-muted"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        <button onClick={() => deleteRecord(r.id)} className="p-1 rounded-lg hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum registro encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{filteredRecords.length} registro(s) encontrado(s)</p>
    </div>
  );
};

export default AdminPonto;
