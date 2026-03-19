import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logoSilverado from "@/assets/logo-silverado.png";
import {
  LayoutDashboard, Users, Nfc, FileText, Bell, Send, LogOut, Menu, X, FileUp,
  Heart, CalendarDays, Clock, Megaphone, Building2, Landmark, BarChart3, ShieldCheck, Home,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Funcionários", icon: Users, path: "/admin/usuarios" },
  { label: "Saúde", icon: Heart, path: "/admin/saude" },
  { label: "Escala", icon: CalendarDays, path: "/admin/escala" },
  { label: "Folha de Ponto", icon: Clock, path: "/admin/ponto" },
  { label: "Pulseiras NFC", icon: Nfc, path: "/admin/pulseiras" },
  { label: "Conteúdo", icon: FileText, path: "/admin/conteudo" },
  { label: "Avisos", icon: Megaphone, path: "/admin/avisos" },
  { label: "Notificações", icon: Send, path: "/admin/notificacoes" },
  
  { label: "Currículos", icon: FileUp, path: "/admin/curriculos" },
  { label: "Cargos & Deptos", icon: Building2, path: "/admin/cargos" },
  { label: "Institucional", icon: Landmark, path: "/admin/institucional" },
  { label: "Relatórios", icon: BarChart3, path: "/admin/relatorios" },
  { label: "Usuários", icon: ShieldCheck, path: "/admin/gerenciar-usuarios" },
];

const AdminLayout = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLabel = NAV_ITEMS.find((n) => n.path === location.pathname)?.label ?? "Admin";

  return (
    <div className="flex min-h-[100dvh] bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card shrink-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <img src={logoSilverado} alt="Silverado" className="h-9 w-auto" />
          <div>
            <p className="text-sm font-bold text-card-foreground leading-tight">Silverado</p>
            <p className="text-[10px] text-muted-foreground">Painel Administrativo</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition
                  ${active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition"
          >
            <Home className="h-4 w-4" />
            Voltar ao Site
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-72 h-full bg-card shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <img src={logoSilverado} alt="Silverado" className="h-8 w-auto" />
                <p className="text-sm font-bold text-card-foreground">Silverado</p>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMobileOpen(false); }}
                    className={`flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition
                      ${active
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="px-3 py-4 border-t border-border space-y-1">
              <button onClick={() => { navigate("/"); setMobileOpen(false); }} className="flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition">
                <Home className="h-4 w-4" /> Voltar ao Site
              </button>
              <button onClick={signOut} className="flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-5 lg:px-8 py-4 border-b border-border bg-card">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{currentLabel}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
