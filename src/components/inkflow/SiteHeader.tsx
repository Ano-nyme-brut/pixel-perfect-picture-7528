import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/inkflow/Logo";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

export function SiteHeader() {
  const { session } = useSession();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/@{$artistSlug}" params={{ artistSlug: "alex-darkink" }}>
              Démo live
            </Link>
          </Button>
          {session ? (
            <Button asChild variant="gold" size="sm">
              <Link to="/dashboard">Mon espace</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login" search={{ redirect: undefined }}>
                  Connexion
                </Link>
              </Button>
              <Button asChild variant="gold" size="sm">
                <Link to="/register">Commencer</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
