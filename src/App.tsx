import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrentEmployeeProvider } from "@/contexts/CurrentEmployeeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import AdminLayout from "@/components/AdminLayout";
import InstallPrompt from "@/components/InstallPrompt";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import Pulseira from "./pages/Pulseira";
import Saude from "./pages/Saude";
import Ponto from "./pages/Ponto";
import Escala from "./pages/Escala";
import Notificacoes from "./pages/Notificacoes";
import Perfil from "./pages/Perfil";
import Institucional from "./pages/Institucional";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPulseiras from "./pages/AdminPulseiras";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminConteudo from "./pages/AdminConteudo";
import AdminNotificacoes from "./pages/AdminNotificacoes";

import AdminCurriculos from "./pages/AdminCurriculos";
import AdminSaude from "./pages/AdminSaude";
import AdminEscala from "./pages/AdminEscala";
import AdminPonto from "./pages/AdminPonto";
import AdminAvisos from "./pages/AdminAvisos";
import AdminCargos from "./pages/AdminCargos";
import AdminInstitucional from "./pages/AdminInstitucional";
import AdminRelatorios from "./pages/AdminRelatorios";
import AdminGerenciarUsuarios from "./pages/AdminGerenciarUsuarios";
import PublicOportunidades from "./pages/PublicOportunidades";
import PublicSaude from "./pages/PublicSaude";
import PublicEventos from "./pages/PublicEventos";
import PublicNoticias from "./pages/PublicNoticias";
import EnviarCurriculo from "./pages/EnviarCurriculo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Feel One App
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CurrentEmployeeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/pulseira/:pulseiraId" element={<Pulseira />} />
              <Route path="/pulseira/:pulseiraId/saude" element={<PublicSaude />} />
              <Route path="/pulseira/:pulseiraId/oportunidades" element={<PublicOportunidades />} />
              <Route path="/pulseira/:pulseiraId/eventos" element={<PublicEventos />} />
              <Route path="/pulseira/:pulseiraId/noticias" element={<PublicNoticias />} />
              <Route path="/pulseira/:pulseiraId/curriculo" element={<EnviarCurriculo />} />
              <Route path="/pulseira/:pulseiraId/institucional" element={<Institucional />} />

              {/* Protected routes - employee app */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/saude" element={<Saude />} />
                  <Route path="/ponto" element={<Ponto />} />
                  <Route path="/escala" element={<Escala />} />
                  <Route path="/notificacoes" element={<Notificacoes />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/institucional" element={<Institucional />} />
                </Route>
              </Route>

              {/* Admin routes - own layout with sidebar */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/pulseiras" element={<AdminPulseiras />} />
                  <Route path="/admin/usuarios" element={<AdminUsuarios />} />
                  <Route path="/admin/conteudo" element={<AdminConteudo />} />
                  <Route path="/admin/notificacoes" element={<AdminNotificacoes />} />
                  
                  <Route path="/admin/curriculos" element={<AdminCurriculos />} />
                  <Route path="/admin/saude" element={<AdminSaude />} />
                  <Route path="/admin/escala" element={<AdminEscala />} />
                  <Route path="/admin/ponto" element={<AdminPonto />} />
                  <Route path="/admin/avisos" element={<AdminAvisos />} />
                  <Route path="/admin/cargos" element={<AdminCargos />} />
                  <Route path="/admin/institucional" element={<AdminInstitucional />} />
                  <Route path="/admin/relatorios" element={<AdminRelatorios />} />
                  <Route path="/admin/gerenciar-usuarios" element={<AdminGerenciarUsuarios />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <InstallPrompt />
        </CurrentEmployeeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
