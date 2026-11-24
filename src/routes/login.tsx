import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, SocialButtons, safeRedirect } from "@/components/inkflow/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Connexion — InkFlow" },
      { name: "description", content: "Connecte-toi à ton espace artiste InkFlow pour gérer tes demandes et acomptes." },
      { property: "og:title", content: "Connexion — InkFlow" },
      { property: "og:description", content: "Accède à ton espace artiste InkFlow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: safeRedirect(search.redirect), replace: true });
  }, [session, search.redirect, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Indique ton email");
      return;
    }
    setLoading(true);
    if (resetMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) toast.error("Envoi impossible. Vérifie l'adresse.");
      else toast.success("Si un compte existe, un lien de réinitialisation vient d'être envoyé.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.includes("Email not confirmed")
          ? "Confirme d'abord ton email via le lien reçu."
          : "Email ou mot de passe incorrect.",
      );
    }
  }

  return (
    <AuthShell
      title={resetMode ? "Mot de passe oublié" : "Bon retour."}
      subtitle={resetMode ? "On t'envoie un lien pour en choisir un nouveau." : "Connecte-toi à ton espace artiste."}
    >
      {!resetMode && <SocialButtons />}
      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {!resetMode && (
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <button type="button" className="text-xs text-muted-foreground hover:text-primary" onClick={() => setResetMode(true)}>
                Oublié ?
              </button>
            </div>
            <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        )}
        <Button type="submit" variant="gold" size="lg" disabled={loading} className="mt-2 w-full">
          {loading && <Loader2 className="animate-spin" />}
          {resetMode ? "Envoyer le lien" : "Se connecter"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {resetMode ? (
          <button className="hover:text-primary" onClick={() => setResetMode(false)}>
            ← Retour à la connexion
          </button>
        ) : (
          <>
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Créer mon espace
            </Link>
          </>
        )}
      </p>
    </AuthShell>
  );
}
