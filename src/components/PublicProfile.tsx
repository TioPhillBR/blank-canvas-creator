import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  HeartPulse, Briefcase, Calendar as CalendarIcon, Newspaper, User, Phone,
  Building2, MessageCircle, Instagram, Linkedin, Home, ChevronLeft, ChevronRight,
  Send, LogIn, Loader2, ArrowRight, LogOut, Upload, Camera,
} from "lucide-react";
import { toast } from "sonner";
import type { Employee } from "@/data/types";

interface BannerItem { id: string; image_url: string; link_url: string | null; title: string | null; }
interface DailyQuoteItem { quote: string; author: string | null; }

interface PublicProfileProps {
  employee: Employee;
  pulseiraId: string;
  wristbandRole?: string;
  /** If true, hide signup/curriculum sections and show logout instead */
  isPrivateView?: boolean;
  onLogout?: () => void;
}

export default function PublicProfile({ employee, pulseiraId, wristbandRole = "employee", isPrivateView = false, onLogout }: PublicProfileProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dailyQuote, setDailyQuote] = useState<DailyQuoteItem | null>(null);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [showUserSignup, setShowUserSignup] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [signupPhoto, setSignupPhoto] = useState<File | null>(null);
  const [signupPhotoPreview, setSignupPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase.from("daily_quotes").select("quote, author").eq("date", today).limit(1).maybeSingle()
      .then(({ data }) => { if (data) setDailyQuote(data as DailyQuoteItem); });

    supabase.from("banners").select("id, image_url, link_url, title").eq("is_active", true).order("sort_order")
      .then(({ data }) => setBanners((data as BannerItem[]) ?? []));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const shortcuts = [
    { label: "Saúde", icon: HeartPulse, path: `/pulseira/${pulseiraId}/saude`, color: "bg-destructive/10 text-destructive" },
    { label: "Oportunidades", icon: Briefcase, path: `/pulseira/${pulseiraId}/oportunidades`, color: "bg-accent/20 text-accent-foreground" },
    { label: "Eventos", icon: CalendarIcon, path: `/pulseira/${pulseiraId}/eventos`, color: "bg-primary/10 text-primary" },
    { label: "Notícias", icon: Newspaper, path: `/pulseira/${pulseiraId}/noticias`, color: "bg-success/10 text-success" },
  ];

  const { fullName, photoUrl, role: empRole, department, socialMedia, emergencyContact } = employee;
  const firstName = fullName.split(" ")[0];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background pb-20">
      {/* Hero */}
      <div className="hero-gradient relative overflow-hidden px-5 pt-5 pb-10">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-accent/15" />
        <div className="relative z-10">
          <div className="flex justify-end mb-2 gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
              wristbandRole === "parceiro"
                ? "bg-accent/20 text-accent-foreground"
                : "bg-hero-foreground/15 text-hero-foreground/80"
            }`}>
              {wristbandRole === "parceiro" ? "Parceiro" : "Funcionário"}
            </span>
            {isPrivateView && onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold bg-destructive/20 text-hero-foreground/80 backdrop-blur-sm"
              >
                <LogOut className="h-3 w-3" />
                Sair
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-hero-foreground/70 text-sm font-medium">Olá,</p>
              <h1 className="text-2xl font-bold text-hero-foreground mt-0.5">{firstName}</h1>
              <p className="text-hero-foreground/60 text-xs mt-1">{empRole} — {department}</p>
            </div>
            <div className="h-16 w-16 rounded-full border-3 border-hero-foreground/30 overflow-hidden shadow-lg">
              {photoUrl ? (
                <img src={photoUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-xl font-bold">
                  {firstName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
        <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-5 text-background">
          <path d="M0,24 L0,0 Q200,28 400,0 L400,24 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        {/* Frase do Dia */}
        <div className="bg-card rounded-3xl p-5 shadow-md border border-border">
          <h2 className="text-sm font-bold text-card-foreground mb-2">Frase do Dia</h2>
          {dailyQuote ? (
            <div className="text-center py-2">
              <p className="text-sm italic text-muted-foreground">"{dailyQuote.quote}"</p>
              {dailyQuote.author && <p className="text-xs text-primary font-medium mt-1">— {dailyQuote.author}</p>}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground italic py-2">Nenhuma frase para hoje</p>
          )}
        </div>

        {/* Quick action icons */}
        <div className="flex items-center justify-around py-2">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-2 group">
                <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${item.color} transition group-active:scale-95`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contato de Emergência */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contato de Emergência</h2>
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-card-foreground">{emergencyContact.name}</p>
              <p className="text-xs text-muted-foreground">{emergencyContact.relationship}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${emergencyContact.phone.replace(/\D/g, "")}`}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-destructive py-3 text-sm font-bold text-destructive-foreground active:scale-[0.97] transition">
              <Phone className="h-4 w-4" />
              Ligar
            </a>
            <a href={`https://wa.me/55${emergencyContact.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white active:scale-[0.97] transition"
              style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Institucional link */}
        <button onClick={() => navigate(`/pulseira/${pulseiraId}/institucional`)} className="flex items-center gap-3 w-full bg-card rounded-2xl p-4 shadow-sm border border-border active:scale-[0.98] transition">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-card-foreground">Institucional</span>
        </button>

        {/* Enviar Currículo - only on public view */}
        {!isPrivateView && (
          <>
            {user ? (
              <button onClick={() => navigate(`/pulseira/${pulseiraId}/curriculo`)}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.97] transition">
                <Send className="h-4 w-4" />
                Enviar Currículo
              </button>
            ) : (
              <div className="space-y-2">
                {!showUserSignup ? (
                  <button onClick={() => setShowUserSignup(true)}
                    className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-primary bg-primary/5 py-3.5 text-sm font-bold text-primary active:scale-[0.97] transition">
                    <LogIn className="h-4 w-4" />
                    Cadastre-se para enviar seu currículo
                  </button>
                ) : (
                  <div className="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Criar conta</h3>
                    {/* Photo */}
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-border shrink-0 bg-muted flex items-center justify-center">
                        {signupPhotoPreview ? (
                          <img src={signupPhotoPreview} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <Camera className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <label className="flex items-center gap-2 rounded-xl bg-primary/10 text-primary px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-primary/20 transition">
                        <Upload className="h-3.5 w-3.5" />
                        {signupPhotoPreview ? "Trocar" : "Foto *"}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setSignupPhoto(f);
                          const reader = new FileReader();
                          reader.onload = () => setSignupPhotoPreview(reader.result as string);
                          reader.readAsDataURL(f);
                        }} />
                      </label>
                    </div>
                    <input value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Nome completo *"
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                    <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="Email *"
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                    <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Senha (min. 6 caracteres) *" minLength={6}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                    <button disabled={signupSubmitting} onClick={async () => {
                      if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) { toast.error("Preencha todos os campos."); return; }
                      if (!signupPhoto) { toast.error("A foto de perfil é obrigatória."); return; }
                      if (signupPassword.length < 6) { toast.error("A senha deve ter no mínimo 6 caracteres."); return; }
                      setSignupSubmitting(true);
                      try {
                        // Upload photo first
                        const ext = signupPhoto.name.split(".").pop();
                        const path = `${crypto.randomUUID()}.${ext}`;
                        const { error: upErr } = await supabase.storage.from("employee-photos").upload(path, signupPhoto, { cacheControl: "3600", upsert: false });
                        if (upErr) throw new Error("Erro no upload da foto: " + upErr.message);
                        const { data: urlData } = supabase.storage.from("employee-photos").getPublicUrl(path);
                        const avatarUrl = urlData.publicUrl;

                        const { data, error } = await supabase.functions.invoke("wristband-signup", {
                          body: { wristband_code: pulseiraId, email: signupEmail.trim(), password: signupPassword, full_name: signupName.trim(), signup_type: "user" },
                        });
                        if (error) throw error;
                        if (data?.error) throw new Error(data.error);
                        const { error: signInErr } = await supabase.auth.signInWithPassword({ email: signupEmail.trim(), password: signupPassword });
                        if (signInErr) throw signInErr;
                        // Update profile with avatar
                        const { data: { user: currentUser } } = await supabase.auth.getUser();
                        if (currentUser) {
                          await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", currentUser.id);
                        }
                        toast.success("Conta criada com sucesso!");
                        setShowUserSignup(false);
                      } catch (err: any) { toast.error(err.message || "Erro ao criar conta."); }
                      setSignupSubmitting(false);
                    }}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground active:scale-[0.97] transition disabled:opacity-50">
                      {signupSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Criar conta
                    </button>
                    <button onClick={() => setShowUserSignup(false)} className="w-full text-xs text-muted-foreground text-center">Cancelar</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Social links */}
        {(socialMedia?.instagram || socialMedia?.linkedin || socialMedia?.whatsapp) && (
          <div className="space-y-2">
            {socialMedia.instagram && (
              <a href={`https://instagram.com/${socialMedia.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-md active:scale-[0.97] transition"
                style={{ background: "linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)" }}>
                <Instagram className="h-5 w-5" />
                Instagram
              </a>
            )}
            {socialMedia.linkedin && (
              <a href={`https://${socialMedia.linkedin}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-md active:scale-[0.97] transition"
                style={{ background: "linear-gradient(135deg, #0077B5, #00A0DC)" }}>
                <Linkedin className="h-5 w-5" />
                LinkedIn
              </a>
            )}
            {socialMedia.whatsapp && (
              <a href={`https://wa.me/55${socialMedia.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-md active:scale-[0.97] transition"
                style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </a>
            )}
          </div>
        )}

        {/* Banners rotativos */}
        {banners.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden shadow-md">
            {banners[bannerIdx]?.link_url ? (
              banners[bannerIdx].link_url!.startsWith("/") ? (
                <div onClick={() => navigate(`/pulseira/${pulseiraId}${banners[bannerIdx].link_url}`)} className="cursor-pointer">
                  <img src={banners[bannerIdx].image_url} alt={banners[bannerIdx].title ?? "Banner"} className="w-full h-auto object-contain" />
                </div>
              ) : (
                <a href={banners[bannerIdx].link_url!} target="_blank" rel="noopener noreferrer">
                  <img src={banners[bannerIdx].image_url} alt={banners[bannerIdx].title ?? "Banner"} className="w-full h-auto object-contain" />
                </a>
              )
            ) : (
              <img src={banners[bannerIdx].image_url} alt={banners[bannerIdx].title ?? "Banner"} className="w-full h-auto object-contain" />
            )}
            {banners.length > 1 && (
              <>
                <button
                  onClick={() => setBannerIdx((prev) => (prev - 1 + banners.length) % banners.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setBannerIdx((prev) => (prev + 1) % banners.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                  {banners.map((_, i) => (
                    <button key={i} onClick={() => setBannerIdx(i)}
                      className={`w-2 h-2 rounded-full transition ${i === bannerIdx ? "bg-white" : "bg-white/40"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Fixed bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {[
            { icon: Home, label: "Início", path: `/pulseira/${pulseiraId}` },
            { icon: HeartPulse, label: "Saúde", path: `/pulseira/${pulseiraId}/saude` },
            { icon: Newspaper, label: "Notícias", path: `/pulseira/${pulseiraId}/noticias` },
            { icon: Building2, label: "Institucional", path: `/pulseira/${pulseiraId}/institucional` },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-muted-foreground">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
