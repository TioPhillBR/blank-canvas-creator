import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileUp, Mail, Phone, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface Resume {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position_interest: string;
  experience: string | null;
  education: string | null;
  skills: string | null;
  additional_notes: string | null;
  created_at: string;
}

const AdminCurriculos = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("resumes").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setResumes((data as Resume[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <p className="text-sm text-muted-foreground">{resumes.length} currículo{resumes.length !== 1 ? "s" : ""} recebido{resumes.length !== 1 ? "s" : ""}</p>

      {resumes.length === 0 && (
        <div className="rounded-2xl bg-card p-12 border border-border text-center">
          <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum currículo recebido ainda.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {resumes.map((r) => (
          <div key={r.id} className="rounded-2xl bg-card p-5 border border-border shadow-sm space-y-3">
            <div>
              <p className="text-sm font-bold text-card-foreground">{r.full_name}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" /> {r.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" /> {r.phone}
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                <Briefcase className="h-3.5 w-3.5 shrink-0 text-primary" /> {r.position_interest}
              </div>
            </div>

            {r.experience && (
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Experiência</p>
                <p className="text-xs text-foreground mt-0.5">{r.experience}</p>
              </div>
            )}
            {r.education && (
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Formação</p>
                <p className="text-xs text-foreground mt-0.5">{r.education}</p>
              </div>
            )}
            {r.skills && (
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Habilidades</p>
                <p className="text-xs text-foreground mt-0.5">{r.skills}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCurriculos;
