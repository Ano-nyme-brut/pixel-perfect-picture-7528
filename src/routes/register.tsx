import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, SocialButtons } from "@/components/inkflow/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { isValidSlug, slugify } from "@/lib/inkflow";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Créer mon espace artiste — InkFlow" },
      {
        name: "description",
        content: "Crée ton lien de réservation InkFlow en 2 minutes : demandes cadrées et acompte automatique.",
      },
      { property: "og:title", content: "Créer mon espace artiste — InkFlow" },
      { property: "og:description", content: "Ton lien de réservation avec acompte automatique, prêt en 2 minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [fullName, setFullName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/dashboard", replace: true });
  }, [session, navigate]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(fullName));
  }, [fullName, slugTouched]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      toast.error("Indique ton nom d'artiste");
      return;
    }
    if (!isValidSlug(slug)) {
      toast.error("Ton lien doit contenir 3 à 40 caractères : lettres, chiffres et tirets.");
      return;
    }
    if (password.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name: fullName.trim(), slug },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("registered") ? "Un compte existe déjà avec cet email." : "Inscription impossible. Réessaie.");
      return;
    }
    if (!data.session) setSent(true);
  }

  if (sent) {
    return (
      <AuthShell title="Vérifie tes emails." subtitle="Plus qu'une étape avant ton espace artiste.">
        <div className="panel flex gap-4 p-5">
          <MailCheck className="size-6 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            On a envoyé un lien de confirmation à <span className="text-foreground">{email}</span>. Clique dessus pour activer ton compte, puis
            connecte-toi.
          </p>
        </div>
        <Button asChild variant="surface" className="mt-6 w-full">
          <Link to="/login">Aller à la connexion</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Ton studio, en ligne." subtitle="Crée ton lien de réservation avec acompte automatique.">
      <SocialButtons />
      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nom d'artiste</Label>
          <Input id="name" placeholder="Alex Darkink" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slug">Ton lien de réservation</Label>
          <div className="flex items-center rounded-md border border-input bg-transparent text-sm focus-within:ring-1 focus-within:ring-ring">
            <span className="pl-3 font-mono text-muted-foreground">inkflow/@</span>
            <input
              id="slug"
              className="h-9 flex-1 bg-transparent pr-3 font-mono outline-none"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              required
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder="8 caractères minimum" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" variant="gold" size="lg" disabled={loading} className="mt-2 w-full">
          {loading && <Loader2 className="animate-spin" />}
          Créer mon espace artiste
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
