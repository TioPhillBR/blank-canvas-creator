import { useFuncionarioAtual } from "@/contexts/CurrentEmployeeContext";
import { HeartPulse, Phone, AlertTriangle, MessageCircle } from "lucide-react";

const Saude = () => {
  const { currentEmployee } = useFuncionarioAtual();

  if (!currentEmployee) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-5">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <HeartPulse className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Nenhum funcionário selecionado. Acesse via pulseira NFC.
        </p>
      </div>
    );
  }

  const { fullName, bloodType, preExistingConditions, medications, allergies, emergencyContact } = currentEmployee;

  return (
    <div className="flex flex-col gap-4 px-5 py-4 max-w-md mx-auto">
      {/* Name & Blood Type */}
      <div className="rounded-2xl bg-card p-5 shadow-sm border border-border">
        <p className="text-base font-bold text-card-foreground">{fullName}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="inline-flex items-center justify-center rounded-xl bg-destructive px-4 py-2 text-xl font-bold text-destructive-foreground shadow-sm">
            {bloodType}
          </span>
          <span className="text-xs text-muted-foreground">Tipo Sanguíneo</span>
        </div>
      </div>

      {/* Allergies */}
      {allergies.length > 0 && (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-sm font-bold text-destructive uppercase tracking-wide">Alergias</h2>
          </div>
          <ul className="space-y-1.5">
            {allergies.map((a, i) => (
              <li key={i} className="text-base font-semibold text-foreground">• {a}</li>
            ))}
          </ul>
        </div>
      )}

      <InfoSection title="Doenças Pré-existentes" items={preExistingConditions} emptyText="Nenhuma registrada" />
      <InfoSection title="Medicações em Uso" items={medications} emptyText="Nenhuma registrada" />

      {/* Emergency contact */}
      <div className="rounded-2xl bg-card p-5 shadow-sm border border-border space-y-3">
        <h2 className="text-sm font-bold text-destructive uppercase tracking-wide">
          Contato de Emergência
        </h2>
        <div className="space-y-2">
          <p className="text-base font-bold text-card-foreground">{emergencyContact.name}</p>
          <p className="text-sm text-muted-foreground">{emergencyContact.relationship}</p>
          <div className="flex gap-2 mt-2">
            <a
              href={`tel:${emergencyContact.phone.replace(/\D/g, "")}`}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-destructive px-4 py-3 text-sm font-bold text-destructive-foreground active:scale-[0.97] transition shadow-sm"
            >
              <Phone className="h-4 w-4" />
              Ligar
            </a>
            <a
              href={`https://wa.me/55${emergencyContact.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white active:scale-[0.97] transition shadow-sm"
              style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoSection = ({ title, items, emptyText }: { title: string; items: string[]; emptyText: string }) => (
  <div className="rounded-2xl bg-card p-5 shadow-sm border border-border space-y-2">
    <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h2>
    {items.length > 0 ? (
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-base text-card-foreground">• {item}</li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-muted-foreground italic">{emptyText}</p>
    )}
  </div>
);

export default Saude;
