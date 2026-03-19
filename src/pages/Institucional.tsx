import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-silverado.png";
import { Building2, Target, Eye, Heart, Phone, Mail, MapPin, Loader2, ArrowLeft } from "lucide-react";
import * as LucideIcons from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Target, Eye, Heart, Phone, Mail, MapPin,
};

function getIcon(name: string | null): React.ElementType {
  if (!name) return Building2;
  return (ICON_MAP[name] ?? (LucideIcons as any)[name] ?? Building2) as React.ElementType;
}

interface Section {
  id: string;
  title: string;
  content: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

const Institucional = () => {
  const navigate = useNavigate();
  const { pulseiraId } = useParams<{ pulseiraId?: string }>();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("institutional_sections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        setSections((data as Section[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 py-6 max-w-sm mx-auto px-4">
      {/* Back button */}
      <button
        onClick={() => navigate(pulseiraId ? `/pulseira/${pulseiraId}` : "/")}
        className="flex items-center gap-2 text-sm font-semibold text-primary active:scale-[0.97] transition self-start"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <img src={logo} alt="Silverado Grupo" className="h-20 w-auto" />
        <h1 className="text-lg font-bold text-foreground">Grupo Silverado</h1>
        <p className="text-xs text-muted-foreground">Tecnologia & Inovação</p>
      </div>

      {/* Dynamic sections from DB */}
      {sections.map((section) => {
        const Icon = getIcon(section.icon);
        // Support list items: lines starting with "- " or "• " are rendered as bullet points
        const lines = section.content.split("\n").filter((l) => l.trim());
        const isList = lines.length > 1 && lines.every((l) => /^[-•]\s/.test(l.trim()));

        return (
          <div
            key={section.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
                {section.title}
              </h2>
            </div>
            {isList ? (
              <ul className="space-y-1.5">
                {lines.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {item.replace(/^[-•]\s*/, "")}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-line">
                {section.content}
              </p>
            )}
          </div>
        );
      })}

      {sections.length === 0 && (
        <p className="text-center text-sm text-muted-foreground italic py-4">
          Nenhuma seção institucional disponível.
        </p>
      )}
    </div>
  );
};

export default Institucional;
