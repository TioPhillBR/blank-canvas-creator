import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFuncionarioAtual } from "@/contexts/CurrentEmployeeContext";
import { useSupabaseDatabase } from "@/hooks/useSupabaseDatabase";
import { Loader2, ArrowRight, Nfc, ChevronDown, ChevronUp, User, Phone, Droplets, AlertTriangle, Pill, ShieldAlert, Instagram, Linkedin, Calendar as CalendarIcon, HeartPulse, Briefcase, Newspaper, Building2, MessageCircle, Home, ChevronLeft, ChevronRight, Send, LogIn, Upload, Camera } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Employee } from "@/data/types";
import PublicProfileComponent from "@/components/PublicProfile";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const RELATIONSHIPS = [
  "Pai", "Mãe", "Filho(a)", "Irmão(ã)", "Cônjuge", "Tio(a)", "Avô(ó)", "Primo(a)", "Sobrinho(a)", "Outro"
];

const GENDERS = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "outro", label: "Outro" },
  { value: "prefiro_nao_informar", label: "Prefiro não informar" },
];

// ---- helpers ----

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(digits[10]);
}

function maskCPF(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskDate(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function parseDateBR(value: string): string | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(+yyyy, +mm - 1, +dd);
  if (date.getDate() !== +dd || date.getMonth() !== +mm - 1 || date.getFullYear() !== +yyyy) return null;
  if (date > new Date() || date < new Date("1900-01-01")) return null;
  return `${yyyy}-${mm}-${dd}`;
}

const Pulseira = () => {
  const { pulseiraId } = useParams<{ pulseiraId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { setCurrentEmployee } = useFuncionarioAtual();
  const { fetchEmployeeById } = useSupabaseDatabase();

  const [wristbandStatus, setWristbandStatus] = useState<"loading" | "not_found" | "claimed" | "available">("loading");
  const [wristbandRole, setWristbandRole] = useState<string>("employee");
  const [existingEmployee, setExistingEmployee] = useState<Employee | null>(null);

  // Auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Employee fields
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfError, setCpfError] = useState("");
  const [phone, setPhone] = useState("");
  const [empRole, setEmpRole] = useState("");
  const [department, setDepartment] = useState("");
  const [bloodType, setBloodType] = useState("O+");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Emergency
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyRelationshipOther, setEmergencyRelationshipOther] = useState("");

  // Health
  const [conditionsText, setConditionsText] = useState("");
  const [medicationsText, setMedicationsText] = useState("");
  const [allergiesText, setAllergiesText] = useState("");

  // Social
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [showHealth, setShowHealth] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!pulseiraId) { setWristbandStatus("not_found"); return; }

    const check = async () => {
      const { data: wb } = await supabase
        .from("wristbands")
        .select("id, employee_id, user_id, code, role")
        .eq("code", pulseiraId)
        .maybeSingle();

      if (!wb) { setWristbandStatus("not_found"); return; }
      setWristbandRole(wb.role ?? "employee");

      if (wb.user_id) {
        setWristbandStatus("claimed");
        if (wb.employee_id) {
          const emp = await fetchEmployeeById(wb.employee_id);
          if (emp) setExistingEmployee(emp);
        }
        return;
      }

      setWristbandStatus("available");
    };
    check();
  }, [pulseiraId, fetchEmployeeById]);

  // Auto-redirect if logged in and wristband is claimed by current user
  useEffect(() => {
    if (user && existingEmployee && !authLoading && wristbandStatus === "claimed") {
      const checkOwnership = async () => {
        const { data: wb } = await supabase
          .from("wristbands")
          .select("user_id")
          .eq("code", pulseiraId!)
          .maybeSingle();
        if (wb?.user_id === user.id) {
          setCurrentEmployee(existingEmployee);
          navigate("/perfil", { replace: true });
        }
      };
      checkOwnership();
    }
  }, [user, existingEmployee, authLoading, wristbandStatus, setCurrentEmployee, navigate, pulseiraId]);

  const handleCpfChange = (value: string) => {
    const masked = maskCPF(value);
    setCpf(masked);
    const digits = masked.replace(/\D/g, "");
    if (digits.length === 11) {
      setCpfError(validateCPF(digits) ? "" : "CPF inválido");
    } else {
      setCpfError("");
    }
  };

  const handlePhoneChange = (setter: (v: string) => void) => (value: string) => {
    setter(maskPhone(value));
  };

  const resolvedRelationship = emergencyRelationship === "Outro"
    ? emergencyRelationshipOther.trim()
    : emergencyRelationship;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;
    const ext = photoFile.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("employee-photos").upload(path, photoFile, { cacheControl: "3600", upsert: false });
    if (error) { toast.error("Erro no upload da foto: " + error.message); return null; }
    const { data } = supabase.storage.from("employee-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !cpf || !phone || !empRole || !department || !emergencyName || !emergencyPhone || !resolvedRelationship || !gender) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!photoFile) {
      toast.error("A foto de perfil é obrigatória.");
      return;
    }
    if (!validateCPF(cpf.replace(/\D/g, ""))) {
      toast.error("CPF inválido. Verifique o número digitado.");
      return;
    }
    setSubmitting(true);

    try {
      // Upload photo first
      const photoUrl = await uploadPhoto();
      if (!photoUrl) { setSubmitting(false); return; }

      const { data, error } = await supabase.functions.invoke("wristband-signup", {
        body: {
          wristband_code: pulseiraId,
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          cpf: cpf.replace(/\D/g, ""),
          photo_url: photoUrl,
          
          phone: phone.trim(),
          role: empRole.trim(),
          department: department.trim(),
          blood_type: bloodType,
          gender,
          birth_date: parseDateBR(birthDate) || null,
          emergency_contact_name: emergencyName.trim(),
          emergency_contact_phone: emergencyPhone.trim(),
          emergency_contact_relationship: resolvedRelationship,
          pre_existing_conditions: conditionsText.split(",").map(s => s.trim()).filter(Boolean),
          medications: medicationsText.split(",").map(s => s.trim()).filter(Boolean),
          allergies: allergiesText.split(",").map(s => s.trim()).filter(Boolean),
          linkedin: linkedin.trim() || null,
          instagram: instagram.trim() || null,
          whatsapp: whatsapp.trim() || null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInErr) throw signInErr;

      toast.success("Cadastro realizado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta.");
    }
    setSubmitting(false);
  };

  // Loading
  if (wristbandStatus === "loading" || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not found
  if (wristbandStatus === "not_found") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background gap-4 px-5">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Nfc className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-lg font-semibold text-destructive">Link inválido</p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Este link de cadastro não existe ou não é válido.
        </p>
        <button onClick={() => navigate("/auth")} className="text-sm text-primary font-semibold mt-2">
          Ir para login
        </button>
      </div>
    );
  }

  // Wristband claimed — show public profile
  if (wristbandStatus === "claimed" && existingEmployee) {
    return <PublicProfileComponent employee={existingEmployee} pulseiraId={pulseiraId!} wristbandRole={wristbandRole} />;
  }

  // Wristband claimed but employee not found
  if (wristbandStatus === "claimed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background gap-4 px-5">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <Nfc className="h-8 w-8 text-accent-foreground" />
        </div>
        <p className="text-lg font-semibold text-foreground">Perfil não encontrado</p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Este link está vinculado a um usuário, mas o perfil não pôde ser carregado.
        </p>
      </div>
    );
  }

  // Signup form
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <div className="hero-gradient relative overflow-hidden px-6 pt-10 pb-14">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-accent/15" />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/20 mb-3">
            <Nfc className="h-7 w-7 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-hero-foreground">Cadastro de {wristbandRole === "parceiro" ? "Parceiro" : "Funcionário"}</h1>
          <p className="text-hero-foreground/60 text-sm mt-2">
            Preencha todos os dados para criar sua conta
          </p>
        </div>
        <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-5 text-background">
          <path d="M0,24 L0,0 Q200,28 400,0 L400,24 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="flex-1 px-5 -mt-6 pb-8">
        <form onSubmit={handleSignup} className="bg-card rounded-3xl p-6 shadow-lg border border-border space-y-4 max-w-md mx-auto">

          {/* Account */}
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dados de Acesso</h2>
          <Field label="Email *" type="email" value={email} onChange={setEmail} />
          <Field label="Senha *" type="password" value={password} onChange={setPassword} minLength={6} />

          {/* Photo upload */}
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">Foto de Perfil *</h2>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-border shrink-0 bg-muted flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 rounded-xl bg-primary/10 text-primary px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-primary/20 transition">
                <Upload className="h-4 w-4" />
                Galeria
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
              </label>
              <label className="flex items-center gap-2 rounded-xl bg-primary/10 text-primary px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-primary/20 transition">
                <Camera className="h-4 w-4" />
                Câmera
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
              </label>
            </div>
          </div>

          {/* Personal */}
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">Dados Pessoais</h2>
          <Field label="Nome completo *" value={fullName} onChange={setFullName} />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">CPF *</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => handleCpfChange(e.target.value)}
              placeholder="000.000.000-00"
              maxLength={14}
              required
              className={cn(
                "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                cpfError ? "border-destructive" : "border-input"
              )}
            />
            {cpfError && <p className="text-xs text-destructive">{cpfError}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Telefone *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(setPhone)(e.target.value)}
              placeholder="(00) 00000-0000"
              required
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Sexo *</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} required
                className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground">
                <option value="">Selecione</option>
                {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Data de Nascimento</label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(maskDate(e.target.value))}
                placeholder="dd/mm/aaaa"
                maxLength={10}
                className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {birthDate.length === 10 && !parseDateBR(birthDate) && (
                <p className="text-xs text-destructive">Data inválida</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Cargo *" value={empRole} onChange={setEmpRole} />
            <Field label="Departamento *" value={department} onChange={setDepartment} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Tipo Sanguíneo *</label>
            <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground">
              {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>

          {/* Emergency contact */}
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">Contato de Emergência</h2>
          <Field label="Nome *" value={emergencyName} onChange={setEmergencyName} />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">WhatsApp do contato *</label>
            <input
              type="tel"
              value={emergencyPhone}
              onChange={(e) => handlePhoneChange(setEmergencyPhone)(e.target.value)}
              placeholder="(00) 00000-0000"
              required
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Parentesco *</label>
            <select value={emergencyRelationship} onChange={(e) => setEmergencyRelationship(e.target.value)} required
              className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground">
              <option value="">Selecione</option>
              {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {emergencyRelationship === "Outro" && (
            <Field label="Especifique o parentesco *" value={emergencyRelationshipOther} onChange={setEmergencyRelationshipOther} />
          )}

          {/* Health (collapsible) */}
          <button type="button" onClick={() => setShowHealth(v => !v)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2 w-full">
            Informações de Saúde (opcional)
            {showHealth ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showHealth && (
            <div className="space-y-3 animate-in fade-in">
              <Field label="Condições pré-existentes (separar por vírgula)" value={conditionsText} onChange={setConditionsText} />
              <Field label="Medicamentos (separar por vírgula)" value={medicationsText} onChange={setMedicationsText} />
              <Field label="Alergias (separar por vírgula)" value={allergiesText} onChange={setAllergiesText} />
            </div>
          )}

          {/* Social (collapsible) */}
          <button type="button" onClick={() => setShowSocial(v => !v)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2 w-full">
            Redes Sociais (opcional)
            {showSocial ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showSocial && (
            <div className="space-y-3 animate-in fade-in">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">WhatsApp</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => handlePhoneChange(setWhatsapp)(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Field label="LinkedIn" value={linkedin} onChange={setLinkedin} />
              <Field label="Instagram" value={instagram} onChange={setInstagram} />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !!cpfError}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.97] transition disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            Cadastrar
          </button>

          <div className="text-center">
            <button type="button" onClick={() => navigate("/auth")} className="text-xs text-muted-foreground">
              Já tem conta? <span className="text-primary font-semibold">Entrar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function Field({ label, value, onChange, type = "text", minLength }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; minLength?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={minLength}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        required={label.includes("*")}
      />
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

// Re-export PublicProfile from shared component
export { default as PublicProfile } from "@/components/PublicProfile";

export default Pulseira;
