import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/inkflow/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — InkFlow" },
      { name: "description", content: "Choisis un nouveau mot de passe pour ton espace artiste InkFlow." },
      { property: "og:title", content: "Nouveau mot de passe — InkFlow" },
      { property: "og:description", content: "Réinitialise ton mot de passe InkFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("8 caractères minimum.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("Lien expiré ou invalide. Redemande un lien depuis la connexion.");
      return;
    }
    toast.success("Mot de passe mis à jour.");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisis un mot de passe solide pour ton espace.">
      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full">
          {loading && <Loader2 className="animate-spin" />}
          Enregistrer
        </Button>
      </form>
    </AuthShell>
  );
}
