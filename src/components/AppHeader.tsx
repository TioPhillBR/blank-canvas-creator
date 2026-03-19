import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, User, LogOut } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/saude": "Cartão de Saúde",
  "/ponto": "Folha de Ponto",
  "/escala": "Escala de Trabalho",
  "/notificacoes": "Notificações",
  "/perfil": "Meu Perfil",
  "/institucional": "Institucional",
  "/admin": "Painel Admin",
};

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, signOut } = useAuth();
  const title = PAGE_TITLES[location.pathname] ?? "Feel One";

  return (
    <header className="hero-gradient relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-accent/20" />
      <div className="absolute -right-4 top-6 w-20 h-20 rounded-full bg-accent/10" />

      <div className="relative z-10 px-5 pt-4 pb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-hero-foreground/80 text-sm font-medium"
          >
            <ChevronLeft className="h-5 w-5" />
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold bg-hero-foreground/15 text-hero-foreground/80 backdrop-blur-sm">
              {role === "admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {role === "admin" ? "Admin" : role === "parceiro" ? "Parceiro" : "Funcionário"}
            </span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-hero-foreground mt-3">{title}</h1>
      </div>

      <svg
        viewBox="0 0 400 24"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-5 text-background"
      >
        <path d="M0,24 L0,0 Q200,28 400,0 L400,24 Z" fill="currentColor" />
      </svg>
    </header>
  );
};

export default AppHeader;
