
-- ============ TABLES ============
CREATE TABLE public.artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  slug text NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  bio text,
  avatar_url text,
  city text,
  instagram_handle text,
  styles text[] NOT NULL DEFAULT '{}',
  deposit_amount numeric(10,2) NOT NULL DEFAULT 50.00,
  stripe_account_id text,
  payout_iban_hint text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT artists_slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]{1,38})[a-z0-9]$'),
  CONSTRAINT artists_deposit_positive CHECK (deposit_amount >= 0 AND deposit_amount <= 1000)
);

GRANT SELECT ON public.artists TO anon;
GRANT SELECT, INSERT, UPDATE ON public.artists TO authenticated;
GRANT ALL ON public.artists TO service_role;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.flashes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  size text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT flashes_price_positive CHECK (price >= 0)
);
CREATE INDEX flashes_artist_idx ON public.flashes(artist_id);

GRANT SELECT ON public.flashes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashes TO authenticated;
GRANT ALL ON public.flashes TO service_role;
ALTER TABLE public.flashes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  reference_code text,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  client_instagram text,
  project_type text NOT NULL CHECK (project_type IN ('flash','custom')),
  flash_id uuid REFERENCES public.flashes(id) ON DELETE SET NULL,
  body_zone text NOT NULL,
  approx_size text NOT NULL,
  description text,
  reference_images text[] NOT NULL DEFAULT '{}',
  preferred_date date,
  preferred_days text[] NOT NULL DEFAULT '{}',
  preferred_time_slot text,
  deposit_amount numeric(10,2) NOT NULL DEFAULT 0,
  deposit_status text NOT NULL DEFAULT 'pending' CHECK (deposit_status IN ('pending','paid','refunded')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','completed')),
  decline_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookings_name_len CHECK (char_length(client_name) BETWEEN 2 AND 120),
  CONSTRAINT bookings_email_len CHECK (char_length(client_email) BETWEEN 5 AND 200),
  CONSTRAINT bookings_desc_len CHECK (description IS NULL OR char_length(description) <= 3000),
  CONSTRAINT bookings_refs_max CHECK (coalesce(array_length(reference_images, 1), 0) <= 3)
);
CREATE INDEX bookings_artist_idx ON public.bookings(artist_id, created_at DESC);

GRANT INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION public.owns_artist(_artist_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.artists WHERE id = _artist_id AND user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_active_artist(_artist_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.artists WHERE id = _artist_id AND is_active)
$$;

GRANT EXECUTE ON FUNCTION public.owns_artist(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_artist(uuid) TO anon, authenticated;

-- ============ POLICIES ============
CREATE POLICY "Public can view active artists" ON public.artists
  FOR SELECT TO anon, authenticated USING (is_active OR user_id = auth.uid());
CREATE POLICY "Artists create own profile" ON public.artists
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Artists update own profile" ON public.artists
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can view available flashes" ON public.flashes
  FOR SELECT TO anon, authenticated
  USING ((is_available AND public.is_active_artist(artist_id)) OR public.owns_artist(artist_id));
CREATE POLICY "Artists insert own flashes" ON public.flashes
  FOR INSERT TO authenticated WITH CHECK (public.owns_artist(artist_id));
CREATE POLICY "Artists update own flashes" ON public.flashes
  FOR UPDATE TO authenticated USING (public.owns_artist(artist_id)) WITH CHECK (public.owns_artist(artist_id));
CREATE POLICY "Artists delete own flashes" ON public.flashes
  FOR DELETE TO authenticated USING (public.owns_artist(artist_id));

CREATE POLICY "Anyone can submit a booking request" ON public.bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND deposit_status IN ('pending','paid')
    AND decline_reason IS NULL
    AND public.is_active_artist(artist_id)
  );
CREATE POLICY "Artists view own bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.owns_artist(artist_id));
CREATE POLICY "Artists update own bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (public.owns_artist(artist_id)) WITH CHECK (public.owns_artist(artist_id));
CREATE POLICY "Artists delete own bookings" ON public.bookings
  FOR DELETE TO authenticated USING (public.owns_artist(artist_id));

-- ============ BOOKING TRIGGER (trusted deposit + reference code) ============
CREATE OR REPLACE FUNCTION public.bookings_before_insert()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  SELECT deposit_amount INTO NEW.deposit_amount FROM public.artists WHERE id = NEW.artist_id;
  NEW.reference_code := 'INK-' || upper(substr(replace(NEW.id::text, '-', ''), 1, 6));
  IF NEW.flash_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.flashes WHERE id = NEW.flash_id AND artist_id = NEW.artist_id
  ) THEN
    NEW.flash_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_before_insert
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.bookings_before_insert();

-- ============ SEED: DEMO ARTIST ============
INSERT INTO public.artists (id, user_id, slug, full_name, bio, avatar_url, city, instagram_handle, styles, deposit_amount, stripe_account_id, payout_iban_hint)
VALUES (
  'a1e7d0c0-0000-4000-8000-000000000001', NULL, 'alex-darkink', 'Alexandre Noir',
  'Tatoueur blackwork & fine line depuis 9 ans. Je travaille sur rendez-vous uniquement, dans un studio privé au cœur de la Croix-Rousse. Pièces sombres, lignes nettes, ornements.',
  '/__l5e/assets-v1/99abd7cc-390b-4fa8-9e54-32cb9911dba2/inkflow-avatar.jpg',
  'Lyon', 'alex.darkink', ARRAY['Blackwork','Fine Line','Ornemental'], 50.00,
  'acct_demo_1QxAlexNoir', 'FR76 •••• •••• •••• 4821'
);

INSERT INTO public.flashes (id, artist_id, title, image_url, price, size, is_available) VALUES
  ('f1a50000-0000-4000-8000-000000000001', 'a1e7d0c0-0000-4000-8000-000000000001', 'Serpent & Dague', '/__l5e/assets-v1/71759f92-d888-4618-8c6a-66e050dd3d22/inkflow-flash-serpent.jpg', 220, '14 cm', true),
  ('f1a50000-0000-4000-8000-000000000002', 'a1e7d0c0-0000-4000-8000-000000000001', 'Sphinx tête de mort', '/__l5e/assets-v1/55c5e217-700e-4c99-8289-32e9f8b2dfb2/inkflow-flash-moth.jpg', 280, '12 cm', true),
  ('f1a50000-0000-4000-8000-000000000003', 'a1e7d0c0-0000-4000-8000-000000000001', 'Rose gothique', '/__l5e/assets-v1/16338d65-32c9-41e9-a354-aedbcc98048a/inkflow-flash-rose.jpg', 180, '10 cm', true),
  ('f1a50000-0000-4000-8000-000000000004', 'a1e7d0c0-0000-4000-8000-000000000001', 'Crâne lunaire', '/__l5e/assets-v1/37b4ebfa-4901-4685-ac12-52aebf15518b/inkflow-flash-skull.jpg', 150, '8 cm', true);

INSERT INTO public.bookings (id, artist_id, client_name, client_email, client_phone, client_instagram, project_type, flash_id, body_zone, approx_size, description, reference_images, preferred_date, preferred_days, preferred_time_slot, deposit_status, status, created_at) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a1e7d0c0-0000-4000-8000-000000000001', 'Camille Laurent', 'camille.laurent@exemple.fr', '06 12 34 56 78', 'camille.lrt', 'custom', NULL, 'Avant-bras', 'Moyen 8-15 cm',
   'Tête de loup géométrique, inspirée du croquis joint. J''aimerais garder les lignes fines et ajouter un peu d''ombrage au pointillé. Intérieur de l''avant-bras gauche. Budget max : 400 €. Pas de cover-up.',
   ARRAY['/__l5e/assets-v1/a4dce8a2-72f9-47cb-935a-01933b196825/inkflow-ref-wolf.jpg'],
   current_date + 12, ARRAY['Mardi','Jeudi'], 'Après-midi', 'paid', 'pending', now() - interval '3 hours'),
  ('b0000000-0000-4000-8000-000000000002', 'a1e7d0c0-0000-4000-8000-000000000001', 'Hugo Martin', 'hugo.martin@exemple.fr', '07 65 43 21 09', 'hugo.mrtn', 'flash', 'f1a50000-0000-4000-8000-000000000002', 'Mollet', 'Moyen 8-15 cm',
   'Le flash Sphinx tête de mort, à l''extérieur du mollet droit. Je suis disponible en semaine le matin.',
   '{}', current_date + 20, ARRAY['Lundi','Mercredi','Vendredi'], 'Matin', 'paid', 'pending', now() - interval '1 day'),
  ('b0000000-0000-4000-8000-000000000003', 'a1e7d0c0-0000-4000-8000-000000000001', 'Léa Moreau', 'lea.moreau@exemple.fr', '06 98 76 54 32', 'lea.mro', 'custom', NULL, 'Côtes', 'Grand > 15 cm',
   'Composition botanique lavande + fougère le long des côtes, style fine line très délicat, sans couleur. Budget max : 600 €. Cover-up léger d''un petit point existant.',
   ARRAY['/__l5e/assets-v1/1a8d7533-abbf-49a5-8ebe-85d314cf12b8/inkflow-ref-botanical.jpg'],
   current_date + 30, ARRAY['Samedi'], 'Matin', 'paid', 'accepted', now() - interval '4 days');

-- ============ NEW ARTIST ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_artist()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  new_artist_id uuid := gen_random_uuid();
  display_name text;
  demo_id uuid := 'a1e7d0c0-0000-4000-8000-000000000001';
  flash_map jsonb := '{}'::jsonb;
  f record;
  new_flash_id uuid;
BEGIN
  display_name := coalesce(nullif(NEW.raw_user_meta_data->>'full_name', ''), nullif(NEW.raw_user_meta_data->>'name', ''), split_part(NEW.email, '@', 1));
  base_slug := lower(coalesce(nullif(NEW.raw_user_meta_data->>'slug', ''), display_name, 'artiste'));
  base_slug := regexp_replace(translate(base_slug, 'àâäáãéèêëíìîïóòôöõúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn'), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  IF char_length(base_slug) < 3 THEN base_slug := 'artiste-' || base_slug; END IF;
  base_slug := trim(both '-' from left(base_slug, 32));
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.artists WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || substr(md5(random()::text), 1, 4);
  END LOOP;

  INSERT INTO public.artists (id, user_id, slug, full_name, city, styles, deposit_amount)
  VALUES (new_artist_id, NEW.id, final_slug, display_name, NULL, ARRAY['Blackwork','Fine Line'], 50.00);

  -- Example flashes & requests so the dashboard is testable immediately
  FOR f IN SELECT * FROM public.flashes WHERE artist_id = demo_id ORDER BY created_at, title LOOP
    new_flash_id := gen_random_uuid();
    INSERT INTO public.flashes (id, artist_id, title, image_url, price, size, is_available)
    VALUES (new_flash_id, new_artist_id, f.title, f.image_url, f.price, f.size, true);
    flash_map := flash_map || jsonb_build_object(f.id::text, new_flash_id::text);
  END LOOP;

  INSERT INTO public.bookings (artist_id, client_name, client_email, client_phone, client_instagram, project_type, flash_id, body_zone, approx_size, description, reference_images, preferred_date, preferred_days, preferred_time_slot, deposit_status, status, created_at)
  SELECT new_artist_id, b.client_name, b.client_email, b.client_phone, b.client_instagram, b.project_type,
         (flash_map->>(b.flash_id::text))::uuid, b.body_zone, b.approx_size, b.description, b.reference_images,
         current_date + (b.preferred_date - b.created_at::date), b.preferred_days, b.preferred_time_slot, b.deposit_status, b.status,
         now() - (now() - b.created_at)
  FROM public.bookings b WHERE b.artist_id = demo_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_artist
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_artist();

-- ============ STORAGE POLICIES ============
CREATE POLICY "Visitors upload booking references"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'booking-references'
    AND public.is_active_artist(((storage.foldername(name))[1])::uuid)
  );
CREATE POLICY "Artists read own booking references"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'booking-references'
    AND public.owns_artist(((storage.foldername(name))[1])::uuid)
  );
CREATE POLICY "Artists delete own booking references"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'booking-references'
    AND public.owns_artist(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Artists manage own media - select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'artist-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Artists manage own media - insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'artist-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Artists manage own media - update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'artist-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Artists manage own media - delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'artist-media' AND (storage.foldername(name))[1] = auth.uid()::text);
