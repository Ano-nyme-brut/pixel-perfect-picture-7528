import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type PublicArtist = {
  id: string;
  slug: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  city: string | null;
  instagram_handle: string | null;
  styles: string[];
  deposit_amount: number;
};

export type PublicFlash = {
  id: string;
  title: string;
  image_url: string;
  price: number;
  size: string | null;
};

export const getPublicArtist = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(60) }).parse(input))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data: artist, error } = await sb
      .from("artists")
      .select("id, slug, full_name, bio, avatar_url, city, instagram_handle, styles, deposit_amount")
      .eq("slug", data.slug.toLowerCase())
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error("Impossible de charger le profil.");
    if (!artist) return { artist: null, flashes: [] as PublicFlash[] };

    const { data: flashes } = await sb
      .from("flashes")
      .select("id, title, image_url, price, size")
      .eq("artist_id", artist.id)
      .eq("is_available", true)
      .order("created_at", { ascending: true });

    return {
      artist: { ...artist, deposit_amount: Number(artist.deposit_amount) } as PublicArtist,
      flashes: (flashes ?? []).map((f) => ({ ...f, price: Number(f.price) })) as PublicFlash[],
    };
  });
