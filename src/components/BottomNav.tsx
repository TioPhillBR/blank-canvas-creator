import { useLocation, useNavigate } from "react-router-dom";
import { Home, Clock, User, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const defaultNavItems = [
  { label: "Início", icon: Home, path: "/" },
  { label: "Ponto", icon: Clock, path: "/ponto" },
  { label: "Perfil", icon: User, path: "/perfil" },
];

const parceiroNavItems = [
  { label: "Início", icon: Home, path: "/" },
  { label: "Editar Perfil", icon: Edit, path: "/perfil" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();

  const navItems = role === "parceiro" ? parceiroNavItems : defaultNavItems;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-2xl transition ${
                  isActive ? "bg-primary/10" : ""
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNav;
