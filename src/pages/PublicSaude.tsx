import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mapEmployee, type Employee } from "@/data/types";
import { Loader2, ArrowLeft, Droplets, ShieldAlert, Pill, AlertTriangle, Phone, User } from "lucide-react";

const PublicSaude = () => {
  const { pulseiraId } = useParams<{ pulseiraId: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pulseiraId) return;
    const load = async () => {
      const { data: wb } = await supabase.from("wristbands").select("employee_id").eq("code", pulseiraId).maybeSingle();
      if (wb?.employee_id) {
        const { data: emp } = await supabase.from("employees").select("*").eq("id", wb.employee_id).maybeSingle();
        if (emp) setEmployee(mapEmployee(emp));
      }
      setLoading(false);
    };
    load();
  }, [pulseiraId]);

  if (loading) return <div className="flex justify-center items-center min-h-[100dvh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!employee) return <div className="flex justify-center items-center min-h-[100dvh] text-muted-foreground">Perfil não encontrado</div>;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <div className="hero-gradient relative overflow-hidden px-6 pt-8 pb-12">
        <button onClick={() => navigate(`/pulseira/${pulseiraId}`)} className="relative z-10 mb-3 text-hero-foreground/70">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-bold text-hero-foreground">Cartão de Saúde</h1>
          <p className="text-hero-foreground/60 text-sm mt-1">{employee.fullName}</p>
        </div>
        <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-5 text-background">
          <path d="M0,24 L0,0 Q200,28 400,0 L400,24 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="flex-1 px-5 -mt-4 pb-8 max-w-md mx-auto w-full space-y-4">
        {/* Tipo sanguíneo */}
        <div className="bg-destructive/10 rounded-3xl p-6 text-center border border-destructive/20">
          <Droplets className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-xs text-destructive font-bold uppercase tracking-wider">Tipo Sanguíneo</p>
          <p className="text-4xl font-black text-destructive mt-1">{employee.bloodType}</p>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-4">
          {employee.preExistingConditions?.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <ShieldAlert className="h-4 w-4" /> Condições Pré-existentes
              </div>
              <p className="text-sm text-foreground">{employee.preExistingConditions.join(", ")}</p>
            </div>
          )}
          {employee.medications?.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Pill className="h-4 w-4" /> Medicamentos
              </div>
              <p className="text-sm text-foreground">{employee.medications.join(", ")}</p>
            </div>
          )}
          {employee.allergies?.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-destructive">
                <AlertTriangle className="h-4 w-4" /> Alergias
              </div>
              <p className="text-sm font-semibold text-destructive">{employee.allergies.join(", ")}</p>
            </div>
          )}
        </div>

        {/* Contato de emergência */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contato de Emergência</h2>
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{employee.emergencyContact.name}</p>
              <p className="text-xs text-muted-foreground">{employee.emergencyContact.relationship}</p>
            </div>
          </div>
          <a href={`tel:${employee.emergencyContact.phone}`}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-destructive py-3 text-sm font-bold text-destructive-foreground mt-2 active:scale-[0.97] transition">
            <Phone className="h-4 w-4" />
            Ligar: {employee.emergencyContact.phone}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PublicSaude;
