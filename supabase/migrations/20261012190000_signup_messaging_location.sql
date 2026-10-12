ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country_iso TEXT,
  ADD COLUMN IF NOT EXISTS location_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_discoverable BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.chat_participants
  ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.call_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice-candidate', 'reject', 'hangup')),
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT call_signals_different_users CHECK (sender_id <> recipient_id)
);

ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat participants can read call signals"
  ON public.call_signals FOR SELECT TO authenticated
  USING (
    auth.uid() = sender_id
    OR auth.uid() = recipient_id
  );

CREATE POLICY "Chat participants can send call signals"
  ON public.call_signals FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_chat_participant(chat_id)
    AND EXISTS (
      SELECT 1 FROM public.chat_participants AS recipient
      WHERE recipient.chat_id = call_signals.chat_id
        AND recipient.user_id = call_signals.recipient_id
    )
  );

CREATE OR REPLACE FUNCTION public.get_unread_message_counts()
RETURNS TABLE (chat_id UUID, unread_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT participant.chat_id, COUNT(message.id)::BIGINT
  FROM public.chat_participants AS participant
  LEFT JOIN public.messages AS message
    ON message.chat_id = participant.chat_id
    AND message.sender_id <> auth.uid()
    AND message.created_at > participant.last_read_at
  WHERE participant.user_id = auth.uid()
  GROUP BY participant.chat_id;
$$;

REVOKE ALL ON FUNCTION public.get_unread_message_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_unread_message_counts() TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_chat_read(target_chat_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'A signed-in user is required';
  END IF;

  UPDATE public.chat_participants
  SET last_read_at = NOW()
  WHERE chat_id = target_chat_id
    AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'You are not a participant in this conversation';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_chat_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_chat_read(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_profile_for_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_username TEXT;
  base_username TEXT;
  requested_school_id UUID;
  requested_level INT;
BEGIN
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  requested_username := lower(regexp_replace(
    coalesce(nullif(NEW.raw_user_meta_data ->> 'username', ''), split_part(NEW.email, '@', 1)),
    '[^a-z0-9_]+',
    '_',
    'g'
  ));
  requested_username := trim(both '_' from requested_username);
  IF length(requested_username) < 3 THEN
    requested_username := 'student_' || substr(replace(NEW.id::text, '-', ''), 1, 8);
  END IF;
  IF length(requested_username) > 24 THEN
    requested_username := substr(requested_username, 1, 24);
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = requested_username AND id <> NEW.id) THEN
    RAISE EXCEPTION 'That username is already in use.';
  END IF;

  IF coalesce(NEW.raw_user_meta_data ->> 'school_id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    requested_school_id := (NEW.raw_user_meta_data ->> 'school_id')::UUID;
  END IF;
  IF coalesce(NEW.raw_user_meta_data ->> 'level', '') ~ '^[1-9][0-9]{2}$' THEN
    requested_level := (NEW.raw_user_meta_data ->> 'level')::INT;
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, username, school_id, department, level, phone_number, country_iso
  )
  VALUES (
    NEW.id,
    NEW.email,
    coalesce(nullif(NEW.raw_user_meta_data ->> 'full_name', ''), split_part(NEW.email, '@', 1)),
    requested_username,
    requested_school_id,
    nullif(NEW.raw_user_meta_data ->> 'department', ''),
    requested_level,
    nullif(NEW.raw_user_meta_data ->> 'phone_number', ''),
    upper(nullif(NEW.raw_user_meta_data ->> 'country_iso', ''))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_auth_user();

INSERT INTO public.schools (name, short_name, state, city) VALUES
  ('Abia State University', 'ABSU', 'Abia', 'Uturu'),
  ('Abubakar Tafawa Balewa University', 'ATBU', 'Bauchi', 'Bauchi'),
  ('Ahmadu Bello University', 'ABU', 'Kaduna', 'Zaria'),
  ('Ajayi Crowther University', 'ACU', 'Oyo', 'Oyo'),
  ('Akwa Ibom State University', 'AKSU', 'Akwa Ibom', 'Ikot Akpaden'),
  ('Alex Ekwueme Federal University Ndufu-Alike', 'AE-FUNAI', 'Ebonyi', 'Ikwo'),
  ('Ambrose Alli University', 'AAU', 'Edo', 'Ekpoma'),
  ('Babcock University', 'BU', 'Ogun', 'Ilishan-Remo'),
  ('Bayero University Kano', 'BUK', 'Kano', 'Kano'),
  ('Benue State University', 'BSU', 'Benue', 'Makurdi'),
  ('Bingham University', 'BU', 'Nasarawa', 'Karu'),
  ('Bowen University', 'BU', 'Osun', 'Iwo'),
  ('Caleb University', 'CU', 'Lagos', 'Imota'),
  ('Caritas University', 'CARITAS', 'Enugu', 'Enugu'),
  ('Chrisland University', 'CLU', 'Ogun', 'Abeokuta'),
  ('Covenant University', 'CU', 'Ogun', 'Ota'),
  ('Delta State University', 'DELSU', 'Delta', 'Abraka'),
  ('Ebonyi State University', 'EBSU', 'Ebonyi', 'Abakaliki'),
  ('Ekiti State University', 'EKSU', 'Ekiti', 'Ado-Ekiti'),
  ('Enugu State University of Science and Technology', 'ESUT', 'Enugu', 'Enugu'),
  ('Federal University of Agriculture, Abeokuta', 'FUNAAB', 'Ogun', 'Abeokuta'),
  ('Federal University of Technology, Akure', 'FUTA', 'Ondo', 'Akure'),
  ('Federal University of Technology, Minna', 'FUTMINNA', 'Niger', 'Minna'),
  ('Federal University of Technology, Owerri', 'FUTO', 'Imo', 'Owerri'),
  ('Federal University Dutse', 'FUD', 'Jigawa', 'Dutse'),
  ('Federal University Kashere', 'FUKASHERE', 'Gombe', 'Kashere'),
  ('Federal University Lokoja', 'FUL', 'Kogi', 'Lokoja'),
  ('Federal University Oye-Ekiti', 'FUOYE', 'Ekiti', 'Oye-Ekiti'),
  ('Federal University of Petroleum Resources, Effurun', 'FUPRE', 'Delta', 'Effurun'),
  ('Federal University of Technology, Babura', 'FUTB', 'Jigawa', 'Babura'),
  ('Federal University of Health Sciences, Ila-Orangun', 'FUHSI', 'Osun', 'Ila-Orangun'),
  ('Federal University of Health Sciences, Otukpo', 'FUHSO', 'Benue', 'Otukpo'),
  ('Federal University of Technology, Ikot Abasi', 'FUTIA', 'Akwa Ibom', 'Ikot Abasi'),
  ('Godfrey Okoye University', 'GOUNI', 'Enugu', 'Enugu'),
  ('Gregory University', 'GU', 'Abia', 'Uturu'),
  ('Imo State University', 'IMSU', 'Imo', 'Owerri'),
  ('Kaduna State University', 'KASU', 'Kaduna', 'Kaduna'),
  ('Kano University of Science and Technology', 'KUST', 'Kano', 'Wudil'),
  ('Kogi State University', 'KSU', 'Kogi', 'Anyigba'),
  ('Kwara State University', 'KWASU', 'Kwara', 'Malete'),
  ('Ladoke Akintola University of Technology', 'LAUTECH', 'Oyo', 'Ogbomoso'),
  ('Lagos State University', 'LASU', 'Lagos', 'Ojo'),
  ('Landmark University', 'LMU', 'Kwara', 'Omu-Aran'),
  ('Michael Okpara University of Agriculture', 'MOUAU', 'Abia', 'Umudike'),
  ('Modibbo Adama University', 'MAU', 'Adamawa', 'Yola'),
  ('Nasarawa State University', 'NSUK', 'Nasarawa', 'Keffi'),
  ('Niger Delta University', 'NDU', 'Bayelsa', 'Wilberforce Island'),
  ('Nnamdi Azikiwe University', 'UNIZIK', 'Anambra', 'Awka'),
  ('Obafemi Awolowo University', 'OAU', 'Osun', 'Ile-Ife'),
  ('Olabisi Onabanjo University', 'OOU', 'Ogun', 'Ago-Iwoye'),
  ('Ondo State University of Medical Sciences', 'UNIMED', 'Ondo', 'Ondo'),
  ('Osun State University', 'UNIOSUN', 'Osun', 'Osogbo'),
  ('Pan-Atlantic University', 'PAU', 'Lagos', 'Ibeju-Lekki'),
  ('Rivers State University', 'RSU', 'Rivers', 'Port Harcourt'),
  ('University of Abuja', 'UNIABUJA', 'FCT', 'Abuja'),
  ('University of Benin', 'UNIBEN', 'Edo', 'Benin City'),
  ('University of Calabar', 'UNICAL', 'Cross River', 'Calabar'),
  ('University of Ibadan', 'UI', 'Oyo', 'Ibadan'),
  ('University of Ilorin', 'UNILORIN', 'Kwara', 'Ilorin'),
  ('University of Jos', 'UNIJOS', 'Plateau', 'Jos'),
  ('University of Lagos', 'UNILAG', 'Lagos', 'Lagos'),
  ('University of Maiduguri', 'UNIMAID', 'Borno', 'Maiduguri'),
  ('University of Nigeria, Nsukka', 'UNN', 'Enugu', 'Nsukka'),
  ('University of Port Harcourt', 'UNIPORT', 'Rivers', 'Port Harcourt'),
  ('University of Uyo', 'UNIUYO', 'Akwa Ibom', 'Uyo'),
  ('Usmanu Danfodiyo University', 'UDUS', 'Sokoto', 'Sokoto'),
  ('Federal Polytechnic Ado-Ekiti', 'FEDPOLYADO', 'Ekiti', 'Ado-Ekiti'),
  ('Federal Polytechnic Bauchi', 'FEDPOLYBAUCHI', 'Bauchi', 'Bauchi'),
  ('Federal Polytechnic Bida', 'FEDPOLYBIDA', 'Niger', 'Bida'),
  ('Federal Polytechnic Ede', 'FEDPOLYEDE', 'Osun', 'Ede'),
  ('Federal Polytechnic Ilaro', 'FEDPOLYILARO', 'Ogun', 'Ilaro'),
  ('Federal Polytechnic Nekede', 'FEDPOLYNEKEDE', 'Imo', 'Owerri'),
  ('Federal Polytechnic Oko', 'FEDPOLYOKO', 'Anambra', 'Oko'),
  ('Yaba College of Technology', 'YABATECH', 'Lagos', 'Yaba'),
  ('Moshood Abiola Polytechnic', 'MAPOLY', 'Ogun', 'Abeokuta'),
  ('Kwara State Polytechnic', 'KWARAPOLY', 'Kwara', 'Ilorin'),
  ('The Polytechnic Ibadan', 'POLYIBADAN', 'Oyo', 'Ibadan'),
  ('Adeniran Ogunsanya College of Education', 'AOCOED', 'Lagos', 'Oto-Ijanikin'),
  ('Federal College of Education (Technical), Akoka', 'FCETAKOKA', 'Lagos', 'Akoka'),
  ('Federal College of Education, Zaria', 'FCEZARIA', 'Kaduna', 'Zaria'),
  ('Nigerian College of Aviation Technology', 'NCAT', 'Kaduna', 'Zaria'),
  ('Nigerian Defence Academy', 'NDA', 'Kaduna', 'Kaduna'),
  ('Nigerian Law School', 'NLS', 'FCT', 'Abuja')
ON CONFLICT (name) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'call_signals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.call_signals;
  END IF;
END $$;
