import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Camera, Upload, User } from "lucide-react";
import type { Employee } from "@/data/types";

interface Props {
  employee: Employee;
}

export default function ParceiroEditProfile({ employee }: Props) {
  const [fullName, setFullName] = useState(employee.fullName);
  const [phone, setPhone] = useState(employee.phone);
  const [email, setEmail] = useState(employee.email);
  const [linkedin, setLinkedin] = useState(employee.socialMedia.linkedin ?? "");
  const [instagram, setInstagram] = useState(employee.socialMedia.instagram ?? "");
  const [whatsapp, setWhatsapp] = useState(employee.socialMedia.whatsapp ?? "");
  const [photoUrl, setPhotoUrl] = useState(employee.photoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${employee.id}/profile.${ext}`;
    const { error } = await supabase.storage
      .from("employee-photos")
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error("Erro ao enviar foto");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("employee-photos").getPublicUrl(path);
    setPhotoUrl(data.publicUrl);
    setUploading(false);
    toast.success("Foto atualizada!");
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("employees")
      .update({
        full_name: fullName,
        phone,
        email,
        linkedin: linkedin || null,
        instagram: instagram || null,
        whatsapp: whatsapp || null,
        photo_url: photoUrl || null,
      })
      .eq("id", employee.id);

    if (error) {
      toast.error("Erro ao salvar perfil");
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-4 px-5 py-4 max-w-md mx-auto">
      <h1 className="text-lg font-bold text-foreground">Editar Perfil</h1>

      {/* Photo */}
      <div className="flex flex-col items-center gap-3">
        <div className="h-24 w-24 rounded-full overflow-hidden border-3 border-primary/20 shadow-md">
          {photoUrl ? (
            <img src={photoUrl} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-3xl font-bold">
              {fullName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
            <Upload className="h-4 w-4" />
            Galeria
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
            <Camera className="h-4 w-4" />
            Câmera
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
          </label>
        </div>
        {uploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </div>

      {/* Fields */}
      <div className="space-y-3 rounded-2xl bg-card p-5 border border-border shadow-sm">
        <Field label="Nome Completo">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="Telefone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="E-mail">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="WhatsApp">
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(00) 00000-0000" />
        </Field>
        <Field label="LinkedIn">
          <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/seu-perfil" />
        </Field>
        <Field label="Instagram">
          <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@seu_perfil" />
        </Field>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full rounded-2xl py-3">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Salvar Alterações
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
