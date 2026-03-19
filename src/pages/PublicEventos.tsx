import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string | null;
  image_url: string | null;
}

const PublicEventos = () => {
  const { pulseiraId } = useParams<{ pulseiraId: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .order("event_date", { ascending: true })
      .then(({ data }) => {
        setItems((data as Event[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <div className="hero-gradient relative overflow-hidden px-6 pt-8 pb-12">
        <button onClick={() => navigate(`/pulseira/${pulseiraId}`)} className="relative z-10 mb-3 text-hero-foreground/70">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative z-10 text-center">
          <Calendar className="h-8 w-8 text-accent mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-hero-foreground">Eventos</h1>
          <p className="text-hero-foreground/60 text-sm mt-1">Próximos eventos da empresa</p>
        </div>
        <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-5 text-background">
          <path d="M0,24 L0,0 Q200,28 400,0 L400,24 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="flex-1 px-5 -mt-4 pb-8 space-y-3 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Nenhum evento disponível no momento.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-5 space-y-2">
                <h3 className="text-base font-bold text-card-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <span className="flex items-center gap-1 text-xs text-primary font-medium">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(item.event_date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                  {item.location && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {item.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PublicEventos;
