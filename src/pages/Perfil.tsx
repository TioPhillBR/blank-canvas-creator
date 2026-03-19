import { useState, useEffect } from "react";
import { useFuncionarioAtual } from "@/contexts/CurrentEmployeeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ParceiroEditProfile from "@/components/ParceiroEditProfile";
import { User, Linkedin, Instagram, Phone, Mail, LogOut, Loader2 } from "lucide-react";

function maskCPF(cpf: string): string {
  return cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})-(\d{2})$/, "***.$2.***-**");
}

const Perfil = () => {
  const { currentEmployee, logout } = useFuncionarioAtual();
  const { role, signOut } = useAuth();
  const [wristbandCode, setWristbandCode] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);

  const isParceiro = role === "parceiro";

  // Fetch wristband code for parceiro
  useEffect(() => {
    if (!isParceiro || !currentEmployee) return;
    setLoadingCode(true);
    supabase
      .from("wristbands")
      .select("code")
      .eq("employee_id", currentEmployee.id)
      .maybeSingle()
      .then(({ data }) => {
        setWristbandCode(data?.code ?? null);
        setLoadingCode(false);
      });
  }, [isParceiro, currentEmployee]);

  if (!currentEmployee) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-5">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Nenhum perfil selecionado. Acesse via pulseira NFC para ver seu perfil.
        </p>
      </div>
    );
  }

  // Parceiro: show edit profile form
  if (isParceiro) {
    return <ParceiroEditProfile employee={currentEmployee} />;
  }

  // Employee: standard profile
  const { fullName, photoUrl, cpf, role: empRole, department, phone, email, socialMedia } = currentEmployee;

  return (
    <div className="flex flex-col gap-4 px-5 py-4 max-w-md mx-auto">
      {/* Profile card */}
      <div className="flex flex-col items-center bg-card rounded-3xl p-6 shadow-sm border border-border">
        <div className="h-20 w-20 rounded-full overflow-hidden shadow-md border-3 border-primary/20">
          {photoUrl ? (
            <img src={photoUrl} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-2xl font-bold">
              {fullName.charAt(0)}
            </div>
          )}
        </div>
        <h1 className="text-lg font-bold text-card-foreground mt-3">{fullName}</h1>
        <p className="text-sm text-muted-foreground">{empRole}</p>
        <span className="text-xs text-primary font-medium mt-1">{department}</span>
      </div>

      {/* Dados Pessoais */}
      <Section title="Dados Pessoais">
        <InfoRow label="CPF" value={maskCPF(cpf)} />
      </Section>

      {/* Contato */}
      <Section title="Contato">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <span className="text-card-foreground">{phone}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <span className="text-card-foreground text-xs">{email}</span>
        </div>
      </Section>

      {/* Redes Sociais */}
      {(socialMedia.linkedin || socialMedia.instagram) && (
        <Section title="Redes Sociais">
          {socialMedia.linkedin && (
            <a href={`https://${socialMedia.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-primary font-medium">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Linkedin className="h-4 w-4" />
              </div>
              LinkedIn
            </a>
          )}
          {socialMedia.instagram && (
            <a href={`https://instagram.com/${socialMedia.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-primary font-medium">
              <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-accent-foreground" />
              </div>
              Instagram
            </a>
          )}
        </Section>
      )}

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-destructive/30 bg-destructive/5 px-4 py-3.5 text-sm font-bold text-destructive transition active:scale-[0.97]"
      >
        <LogOut className="h-4 w-4" />
        Sair da Pulseira
      </button>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="w-full rounded-2xl bg-card p-5 shadow-sm border border-border space-y-3">
    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold text-card-foreground">{value}</span>
  </div>
);

export default Perfil;
