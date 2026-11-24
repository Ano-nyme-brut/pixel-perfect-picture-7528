import type { ReactNode } from "react";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { toast } from "sonner";
import heroAsset from "@/assets/inkflow-hero.jpg.asset.json";
import { Logo } from "@/components/inkflow/Logo";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12 animate-rise">
          <h1 className="font-display text-5xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-border lg:block">
        <img src={heroAsset.url} alt="Tatoueur au travail dans un studio sombre" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-fade-bottom" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="font-display text-4xl leading-tight">
            « Mes DMs sont enfin calmes. Les clients arrivent avec un projet clair <span className="text-gold">et l'acompte réglé.</span> »
          </p>
          <p className="mt-4 eyebrow">Alexandre Noir — Blackwork, Lyon</p>
        </div>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

export function SocialButtons() {
  async function signIn(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: `${window.location.origin}/login`,
    });
    if (result.error) {
      toast.error("Connexion impossible. Réessaie dans un instant.");
    }
  }
  return (
    <div className="grid gap-2">
      <Button type="button" variant="google" size="lg" className="w-full px-3" onClick={() => signIn("google")}>
        <GoogleG />
        Continuer avec Google
      </Button>
      <Button type="button" variant="surface" size="lg" className="w-full" onClick={() => signIn("lovable")}>
        <LovableMark className="size-[18px]" />
        Continuer avec Lovable
      </Button>
      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou par email
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

export function safeRedirect(value: unknown): string {
  if (typeof value !== "string") return "/dashboard";
  try {
    const url = new URL(value, "http://x");
    if (value.startsWith("//") || (value.startsWith("http") && url.host !== window.location.host)) return "/dashboard";
    const path = url.pathname + url.search;
    return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
  } catch {
    return "/dashboard";
  }
}
