import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeEuro,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Instagram,
  Link2,
  MessageSquareOff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import heroAsset from "@/assets/inkflow-hero.jpg.asset.json";
import wolfAsset from "@/assets/inkflow-ref-wolf.jpg.asset.json";
import mothAsset from "@/assets/inkflow-flash-moth.jpg.asset.json";
import { SiteHeader } from "@/components/inkflow/SiteHeader";
import { Logo } from "@/components/inkflow/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "InkFlow — Fini les DMs sans fin et les lapins" },
      {
        name: "description",
        content:
          "Vos rendez-vous de tatouage cadrés, avec acompte automatique. Un lien dans votre bio Instagram, des demandes complètes, zéro lapin.",
      },
      { property: "og:title", content: "InkFlow — Fini les DMs sans fin et les lapins" },
      {
        property: "og:description",
        content: "Vos rendez-vous de tatouage cadrés, avec acompte automatique.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Des demandes enfin complètes",
    text: "Zone, taille, références, budget, disponibilités : le client remplit tout avant de vous écrire. Plus de « c'est combien un petit tatouage ? ».",
  },
  {
    icon: BadgeEuro,
    title: "Acompte encaissé d'office",
    text: "Chaque demande arrive avec son acompte réglé par carte ou Apple Pay, versé sur votre compte. Les lapins disparaissent.",
  },
  {
    icon: CalendarCheck,
    title: "Un tableau de bord net",
    text: "Acceptez, refusez avec un message poli prêt à l'emploi, ouvrez la fiche complète. Tout est au même endroit.",
  },
];

const STEPS = [
  { n: "01", title: "Créez votre lien", text: "Bio, styles, flashs disponibles et montant d'acompte. Deux minutes chrono." },
  { n: "02", title: "Mettez-le en bio", text: "inkflow/@votre-nom dans Instagram. Vos clients réservent depuis leur téléphone." },
  { n: "03", title: "Validez, encaissez", text: "Les demandes cadrées arrivent avec l'acompte. Vous n'avez plus qu'à dire oui." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-vignette">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
          <div className="animate-rise">
            <Badge variant="gold" className="gap-1.5 px-3 py-1 font-mono text-[11px] uppercase tracking-widest">
              <Sparkles className="size-3" /> Pour les tatoueurs indépendants
            </Badge>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
              Fini les DMs sans fin et les lapins.
            </h1>
            <p className="mt-5 max-w-xl font-display text-2xl italic leading-snug text-gold sm:text-3xl">
              Vos rendez-vous de tatouage cadrés, avec acompte automatique.
            </p>
            <p className="mt-6 max-w-lg text-muted-foreground">
              Un seul lien dans votre bio. Vos clients choisissent un flash ou décrivent leur projet, déposent leurs
              références et règlent l'acompte. Vous recevez une demande prête à valider.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" size="xl">
                <Link to="/register">
                  Créer mon espace artiste <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="surface" size="xl">
                <Link to="/@{$artistSlug}" params={{ artistSlug: "alex-darkink" }}>
                  Voir la démo live
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> Sans engagement</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Paiement sécurisé Stripe</span>
              <span className="inline-flex items-center gap-2"><Instagram className="size-4 text-primary" /> Pensé pour la bio Insta</span>
            </div>
          </div>

          <div className="relative animate-rise [animation-delay:150ms]">
            <div className="grain relative aspect-[4/5] overflow-hidden rounded-xl border border-border shadow-panel">
              <img src={heroAsset.url} alt="Tatoueur traçant un motif fine line sur un avant-bras" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-fade-bottom opacity-70" />
            </div>
            <div className="panel absolute -left-4 top-10 w-64 p-4 sm:-left-10">
              <div className="flex items-center gap-3">
                <img src={wolfAsset.url} alt="" className="size-11 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Camille L. · Avant-bras</p>
                  <p className="text-xs text-muted-foreground">Projet custom · Moyen 8-15 cm</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="success">Acompte payé</Badge>
                <span className="font-mono text-xs text-primary">+50,00 €</span>
              </div>
            </div>
            <div className="panel absolute -right-2 bottom-10 w-56 p-4 sm:-right-6">
              <p className="eyebrow">Flash réservé</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="size-11 overflow-hidden rounded-md bg-paper">
                  <img src={mothAsset.url} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium">Sphinx tête de mort</p>
                  <p className="text-xs text-muted-foreground">Mollet · Jeudi matin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain → gain */}
      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:grid-cols-3">
          {[
            { icon: MessageSquareOff, label: "Moins d'allers-retours", text: "Les infos utiles arrivent dès le premier message." },
            { icon: BadgeEuro, label: "Acompte avant le créneau", text: "Le client s'engage, vous bloquez sereinement." },
            { icon: Link2, label: "Un seul lien", text: "Profil, flashs et réservation au même endroit." },
          ].map((s) => (
            <div key={s.label} className="flex gap-4">
              <s.icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{s.label}</p>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <p className="eyebrow">Ce que fait InkFlow</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl sm:text-5xl">
          Votre agenda, sans le chaos des messages privés.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="panel p-6 transition-colors hover:border-border-strong">
              <div className="flex size-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-medium">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <p className="eyebrow">Comment ça marche</p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <span className="font-display text-6xl text-gold">{s.n}</span>
                <h3 className="mt-3 text-lg font-medium">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-24">
        <div className="grain mx-auto max-w-6xl overflow-hidden rounded-xl border border-primary/25 bg-vignette p-10 text-center sm:p-16">
          <h2 className="mx-auto max-w-2xl font-display text-4xl sm:text-5xl">
            Prêt à ne plus jamais courir après un acompte ?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Testez le parcours client comme si vous étiez sur Instagram, puis créez votre propre lien.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="gold" size="xl">
              <Link to="/register">Créer mon espace artiste</Link>
            </Button>
            <Button asChild variant="surface" size="xl">
              <Link to="/@{$artistSlug}" params={{ artistSlug: "alex-darkink" }}>
                Réserver chez Alexandre (démo)
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} InkFlow — Fait pour les artistes tatoueurs.</p>
        </div>
      </footer>
    </div>
  );
}
