import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import AppHeader from "./AppHeader";

const PAGES_WITHOUT_HEADER = ["/", "/perfil"];

const AppLayout = () => {
  const location = useLocation();
  const hideHeader = PAGES_WITHOUT_HEADER.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {!hideHeader && <AppHeader />}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
