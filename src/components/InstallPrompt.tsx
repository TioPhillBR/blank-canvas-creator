import { useEffect, useState } from "react";
import logo from "@/assets/logo-silverado.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  };

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-4">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-lg max-w-sm mx-auto">
        <img src={logo} alt="Feel One" className="h-10 w-10 rounded-lg" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-card-foreground">Instalar Feel One</p>
          <p className="text-xs text-muted-foreground">Adicione à tela inicial para acesso rápido.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Depois
          </button>
          <button
            onClick={handleInstall}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
