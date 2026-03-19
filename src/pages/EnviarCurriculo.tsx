import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Send, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const EnviarCurriculo = () => {
  const { pulseiraId } = useParams<{ pulseiraId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [positionInterest, setPositionInterest] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background items-center justify-center px-5 gap-4">
        <p className="text-muted-foreground text-sm text-center">Você precisa estar logado para enviar seu currículo.</p>
        <button onClick={() => navigate(`/pulseira/${pulseiraId}`)} className="text-primary font-semibold text-sm">Voltar</button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background items-center justify-center px-5 gap-4">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Currículo enviado!</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">Seu currículo foi recebido pela Silverado. Entraremos em contato caso haja uma vaga adequada ao seu perfil.</p>
        <button onClick={() => navigate(`/pulseira/${pulseiraId}`)} className="text-primary font-semibold text-sm mt-2">Voltar ao perfil</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !positionInterest.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("resumes").insert({
      user_id: user.id,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      position_interest: positionInterest.trim(),
      experience: experience.trim() || null,
      education: education.trim() || null,
      skills: skills.trim() || null,
      additional_notes: additionalNotes.trim() || null,
      wristband_code: pulseiraId || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erro ao enviar currículo: " + error.message);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <div className="hero-gradient relative overflow-hidden px-6 pt-8 pb-12">
        <button onClick={() => navigate(-1)} className="relative z-10 mb-3 text-hero-foreground/70">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative z-10 text-center">
          <Send className="h-8 w-8 text-accent mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-hero-foreground">Enviar Currículo</h1>
          <p className="text-hero-foreground/60 text-sm mt-1">Preencha seus dados para candidatura</p>
        </div>
        <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-5 text-background">
          <path d="M0,24 L0,0 Q200,28 400,0 L400,24 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="flex-1 px-5 -mt-4 pb-8">
        <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-6 shadow-lg border border-border space-y-4 max-w-md mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dados Pessoais</h2>
          <FormField label="Nome completo *" value={fullName} onChange={setFullName} />
          <FormField label="Email *" type="email" value={email} onChange={setEmail} />
          <FormField label="Telefone / WhatsApp *" type="tel" value={phone} onChange={setPhone} placeholder="(00) 00000-0000" />

          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">Informações Profissionais</h2>
          <FormField label="Cargo / Área de interesse *" value={positionInterest} onChange={setPositionInterest} placeholder="Ex: Engenheiro Civil, Técnico em Segurança..." />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Experiência profissional</label>
            <textarea value={experience} onChange={e => setExperience(e.target.value)} rows={4} placeholder="Descreva suas experiências anteriores..."
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <FormField label="Formação acadêmica" value={education} onChange={setEducation} placeholder="Ex: Engenharia Civil - USP (2020)" />
          <FormField label="Habilidades e competências" value={skills} onChange={setSkills} placeholder="Ex: AutoCAD, MS Project, Gestão de equipes..." />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Observações adicionais</label>
            <textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} rows={3} placeholder="Algo mais que gostaria de informar?"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.97] transition disabled:opacity-50">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar Currículo
          </button>
        </form>
      </div>
    </div>
  );
};

function FormField({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        required={label.includes("*")}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}

export default EnviarCurriculo;
