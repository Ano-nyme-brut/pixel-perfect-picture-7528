import type { Database } from "@/integrations/supabase/types";

export type Artist = Database["public"]["Tables"]["artists"]["Row"];
export type Flash = Database["public"]["Tables"]["flashes"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingStatus = "pending" | "accepted" | "declined" | "completed";
export type DepositStatus = "pending" | "paid" | "refunded";

export const BODY_ZONES = [
  "Avant-bras",
  "Bras complet",
  "Cuisse",
  "Mollet",
  "Dos",
  "Torse",
  "Côtes",
  "Main",
  "Autre",
] as const;

export const SIZES = [
  { value: "Petit < 8 cm", label: "Petit", hint: "< 8 cm" },
  { value: "Moyen 8-15 cm", label: "Moyen", hint: "8 – 15 cm" },
  { value: "Grand > 15 cm", label: "Grand", hint: "> 15 cm" },
  { value: "Grosse pièce / Manche", label: "Grosse pièce", hint: "Manche, dos complet" },
] as const;

export const WEEK_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] as const;
export const TIME_SLOTS = ["Matin", "Après-midi"] as const;

export const STYLE_OPTIONS = [
  "Blackwork",
  "Fine Line",
  "Ornemental",
  "Old School",
  "Réalisme",
  "Dotwork",
  "Japonais",
  "Lettering",
  "Géométrique",
  "Neo-traditionnel",
] as const;

export const DECLINE_TEMPLATES = [
  "Merci beaucoup pour ta demande et ta confiance ! Malheureusement ce projet ne correspond pas à mon style actuel. Je te souhaite de trouver l'artiste parfait pour le réaliser.",
  "Merci pour ta demande ! Mon agenda est complet pour les prochains mois et je ne peux pas prendre ce projet. N'hésite pas à revenir vers moi à la réouverture des réservations.",
  "Merci pour ton message ! La taille ou la zone demandée ne me permet pas de garantir un rendu de qualité. Je te propose d'en rediscuter si tu es ouvert·e à une autre option.",
] as const;

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
export function formatEuro(amount: number | string | null | undefined): string {
  return euro.format(Number(amount ?? 0));
}

/** Mirrors the database trigger: INK- + first 6 hex chars of the booking id. */
export function referenceCode(id: string): string {
  return "INK-" + id.replace(/-/g, "").slice(0, 6).toUpperCase();
}

/** French mobile/landline number: 10 digits starting with 0, or +33 followed by 9 digits. */
export function isValidFrenchPhone(raw: string): boolean {
  const digits = raw.replace(/[\s.-]/g, "");
  return /^0[1-9]\d{8}$/.test(digits) || /^\+33[1-9]\d{8}$/.test(digits);
}

export function normalizeInstagram(raw: string): string {
  return raw.trim().replace(/^@+/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
}

export function slugify(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]([a-z0-9-]{1,38})[a-z0-9]$/.test(slug);
}

export type BookingMetrics = {
  pending: number;
  confirmed: number;
  depositsThisMonth: number;
};

/**
 * Dashboard metrics.
 * - pending: requests still waiting for the artist's decision
 * - confirmed: accepted or completed requests
 * - depositsThisMonth: sum of deposits actually kept (status "paid") for requests created this calendar month
 */
export function computeMetrics(
  bookings: Pick<Booking, "status" | "deposit_status" | "deposit_amount" | "created_at">[],
  now: Date = new Date(),
): BookingMetrics {
  let pending = 0;
  let confirmed = 0;
  let depositsThisMonth = 0;
  for (const b of bookings) {
    if (b.status === "pending") pending++;
    if (b.status === "accepted" || b.status === "completed") confirmed++;
    const created = new Date(b.created_at);
    if (
      b.deposit_status === "paid" &&
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth()
    ) {
      depositsThisMonth += Number(b.deposit_amount);
    }
  }
  return { pending, confirmed, depositsThisMonth: Math.round(depositsThisMonth * 100) / 100 };
}

export type BoardTab = "todo" | "confirmed" | "declined";
export function bookingTab(status: string): BoardTab {
  if (status === "accepted" || status === "completed") return "confirmed";
  if (status === "declined") return "declined";
  return "todo";
}

export function composeDescription(input: {
  motif: string;
  budget?: string;
  coverUp: boolean;
  coverUpDetails?: string;
}): string {
  const lines = [input.motif.trim()];
  if (input.budget && input.budget.trim()) lines.push(`Budget max : ${input.budget.trim()} €`);
  lines.push(
    input.coverUp
      ? `Cover-up : oui${input.coverUpDetails?.trim() ? ` — ${input.coverUpDetails.trim()}` : ""}`
      : "Cover-up : non",
  );
  return lines.filter(Boolean).join("\n\n");
}

/** Reference images are either app/CDN URLs (seed data) or paths inside the private references bucket. */
export function isDirectImageUrl(value: string): boolean {
  return value.startsWith("/") || /^https?:\/\//.test(value);
}

export function whatsappLink(phone: string | null | undefined, text: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("0")) digits = "33" + digits.slice(1);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function formatDateFr(value: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value.length === 10 ? value + "T12:00:00" : value) : value;
  return d.toLocaleDateString("fr-FR", opts ?? { day: "numeric", month: "long", year: "numeric" });
}
