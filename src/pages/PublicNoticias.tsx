import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

const PublicNoticias = () => {
  const { pulseiraId } = useParams<{ pulseiraId: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("news")
      .select("*")
      .eq("is_published", true)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as NewsItem[]) ?? []);
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
          <Newspaper className="h-8 w-8 text-accent mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-hero-foreground">Notícias</h1>
          <p className="text-hero-foreground/60 text-sm mt-1">Fique por dentro das novidades</p>
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
            <p className="text-muted-foreground text-sm">Nenhuma notícia disponível no momento.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-5 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
                  {format(new Date(item.created_at), "dd MMM yyyy", { locale: ptBR })}
                </p>
                <h3 className="text-base font-bold text-card-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PublicNoticias;
