import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isDirectImageUrl, type Artist, type Booking, type Flash } from "@/lib/inkflow";

export const myArtistQuery = () =>
  queryOptions({
    queryKey: ["my-artist"],
    queryFn: async (): Promise<Artist> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Non connecté");
      const { data, error } = await supabase.from("artists").select("*").eq("user_id", uid).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Profil artiste introuvable");
      return data;
    },
  });

export const bookingsQuery = (artistId: string) =>
  queryOptions({
    queryKey: ["bookings", artistId],
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("artist_id", artistId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const flashesQuery = (artistId: string) =>
  queryOptions({
    queryKey: ["flashes", artistId],
    queryFn: async (): Promise<Flash[]> => {
      const { data, error } = await supabase
        .from("flashes")
        .select("*")
        .eq("artist_id", artistId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const referenceUrlsQuery = (bookingId: string, refs: string[]) =>
  queryOptions({
    queryKey: ["reference-urls", bookingId, refs],
    staleTime: 50 * 60 * 1000,
    queryFn: async (): Promise<string[]> => {
      const storagePaths = refs.filter((r) => !isDirectImageUrl(r));
      const signed = new Map<string, string>();
      if (storagePaths.length) {
        const { data } = await supabase.storage.from("booking-references").createSignedUrls(storagePaths, 3600);
        for (const item of data ?? []) if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
      }
      return refs.map((r) => (isDirectImageUrl(r) ? r : (signed.get(r) ?? ""))).filter(Boolean);
    },
  });

/** Uploads an image to the artist's private media folder and returns a long-lived signed URL. */
export async function uploadArtistImage(file: File, folder: "flashes" | "avatar"): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error("Non connecté");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${uid}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("artist-media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage
    .from("artist-media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (signError || !data) throw signError ?? new Error("URL indisponible");
  return data.signedUrl;
}
