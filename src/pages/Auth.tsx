import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

type AuthMode = "login" | "signup" | "magic" | "forgot";

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email || !password || !fullName) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    // Auto-login after signup
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      toast.error("Conta criada, mas não foi possível entrar automaticamente. Faça login manualmente.");
    } else {
      toast.success("Conta criada com sucesso!");
    }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
    else toast.success("Link mágico enviado! Verifique seu email.");
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Email de recuperação enviado!");
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") handleLogin();
    else if (mode === "signup") handleSignup();
    else if (mode === "magic") handleMagicLink();
    else handleForgotPassword();
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {/* Hero */}
      <div className="hero-gradient relative overflow-hidden px-6 pt-12 pb-16">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-accent/15" />
        <div className="absolute right-8 top-24 w-16 h-16 rounded-full bg-accent/10" />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-hero-foreground/60 text-xs font-semibold uppercase tracking-widest">Feel One</span>
          </div>
          <h1 className="text-3xl font-bold text-hero-foreground">
            {mode === "login" && "Bem-vindo de volta"}
            {mode === "signup" && "Criar conta"}
            {mode === "magic" && "Login rápido"}
            {mode === "forgot" && "Recuperar senha"}
          </h1>
          <p className="text-hero-foreground/60 text-sm mt-2">
            {mode === "login" && "Entre com suas credenciais"}
            {mode === "signup" && "Preencha os dados abaixo"}
            {mode === "magic" && "Receba um link no seu email"}
            {mode === "forgot" && "Informe seu email para redefinir"}
          </p>
        </div>
        <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-5 text-background">
          <path d="M0,24 L0,0 Q200,28 400,0 L400,24 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 -mt-6 pb-8">
        <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-6 shadow-lg border border-border space-y-4 max-w-md mx-auto">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>

          {(mode === "login" || mode === "signup") && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  minLength={6}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.97] transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {mode === "login" && "Entrar"}
            {mode === "signup" && "Criar conta"}
            {mode === "magic" && "Enviar link"}
            {mode === "forgot" && "Enviar email"}
          </button>

          {mode === "login" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">ou</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-background py-3 text-sm font-semibold text-foreground hover:bg-muted transition"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar com Google
              </button>

              <button
                type="button"
                onClick={() => setMode("magic")}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-background py-3 text-sm font-semibold text-foreground hover:bg-muted transition"
              >
                <Sparkles className="h-4 w-4 text-accent" />
                Entrar com Magic Link
              </button>
            </>
          )}

          <div className="flex flex-col items-center gap-2 pt-2">
            {mode === "login" && (
              <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary font-semibold">
                Esqueceu a senha?
              </button>
            )}
            {mode !== "login" && (
              <button type="button" onClick={() => setMode("login")} className="text-xs text-muted-foreground">
                Voltar ao <span className="text-primary font-semibold">Login</span>
              </button>
            )}
            <p className="text-[10px] text-muted-foreground text-center mt-1 max-w-xs">
              Cadastros são feitos exclusivamente via pulseira NFC. Procure um administrador.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
