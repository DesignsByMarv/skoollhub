ALTER TABLE public.houses
  ADD COLUMN IF NOT EXISTS room_type TEXT NOT NULL DEFAULT 'Single room',
  ADD COLUMN IF NOT EXISTS caution_deposit NUMERIC NOT NULL DEFAULT 0 CHECK (caution_deposit >= 0),
  ADD COLUMN IF NOT EXISTS agency_fee NUMERIC NOT NULL DEFAULT 0 CHECK (agency_fee >= 0),
  ADD COLUMN IF NOT EXISTS legal_fee NUMERIC NOT NULL DEFAULT 0 CHECK (legal_fee >= 0),
  ADD COLUMN IF NOT EXISTS service_charge NUMERIC NOT NULL DEFAULT 0 CHECK (service_charge >= 0),
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC CHECK (distance_km IS NULL OR distance_km >= 0),
  ADD COLUMN IF NOT EXISTS walk_minutes INT CHECK (walk_minutes IS NULL OR walk_minutes >= 0),
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'free'
    CHECK (payment_status IN ('free', 'pending', 'paid'));

ALTER TABLE public.roommate_profiles
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IS NULL OR gender IN ('male', 'female', 'prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS gender_preference TEXT NOT NULL DEFAULT 'any'
    CHECK (gender_preference IN ('any', 'male', 'female')),
  ADD COLUMN IF NOT EXISTS budget_share NUMERIC CHECK (budget_share IS NULL OR budget_share >= 0),
  ADD COLUMN IF NOT EXISTS study_habit TEXT,
  ADD COLUMN IF NOT EXISTS cleanliness TEXT,
  ADD COLUMN IF NOT EXISTS social_style TEXT,
  ADD COLUMN IF NOT EXISTS smokes BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cooks BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS contact_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();

UPDATE public.classes SET id = uuid_generate_v4() WHERE id IS NULL;
ALTER TABLE public.classes ALTER COLUMN id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.classes'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.classes ADD CONSTRAINT classes_pkey PRIMARY KEY (id);
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.planner_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 160),
  description TEXT CHECK (description IS NULL OR length(description) <= 2000),
  course_code TEXT CHECK (course_code IS NULL OR length(course_code) <= 32),
  due_at TIMESTAMPTZ,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  course_code TEXT NOT NULL CHECK (length(trim(course_code)) BETWEEN 1 AND 32),
  course_title TEXT NOT NULL CHECK (length(trim(course_title)) BETWEEN 1 AND 120),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 160),
  description TEXT CHECK (description IS NULL OR length(description) <= 2000),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL CHECK (length(trim(file_name)) BETWEEN 1 AND 255),
  file_type TEXT NOT NULL DEFAULT 'other'
    CHECK (file_type IN ('lecture_notes', 'pdf', 'presentation', 'past_question', 'study_guide', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS planner_tasks_user_due_idx
  ON public.planner_tasks (user_id, due_at);
CREATE INDEX IF NOT EXISTS course_materials_school_course_idx
  ON public.course_materials (school_id, course_code, created_at DESC);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE CHECK (code IN ('free', 'premium', 'ai_pro')),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  amount_kobo INT NOT NULL DEFAULT 0 CHECK (amount_kobo >= 0),
  billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.subscription_plans (code, name, description, amount_kobo, is_active, features)
VALUES
  ('free', 'Student', 'Core campus community features.', 0, TRUE, '["Campus feed", "Messages", "Study planner"]'::jsonb),
  ('premium', 'Premium', 'Expanded student tools and benefits.', 0, FALSE, '["Premium benefits"]'::jsonb),
  ('ai_pro', 'AI Pro', 'Higher AI assistant usage limits.', 0, FALSE, '["Expanded AI usage"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_subscriptions_one_active_per_user
  ON public.user_subscriptions (user_id)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('housing_listing', 'housing_featured', 'housing_contact', 'subscription')),
  amount_kobo INT NOT NULL CHECK (amount_kobo > 0),
  currency TEXT NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
  provider TEXT NOT NULL DEFAULT 'paystack' CHECK (provider = 'paystack'),
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  resource_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS payment_id UUID UNIQUE REFERENCES public.payments(id);

CREATE TABLE IF NOT EXISTS public.housing_contact_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL UNIQUE REFERENCES public.payments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (house_id, user_id)
);

INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', TRUE)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.planner_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_contact_unlocks ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_skoollhub_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
  );
$$;

REVOKE ALL ON FUNCTION public.is_skoollhub_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_skoollhub_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
    AND auth.uid() = OLD.id
    AND NOT public.is_skoollhub_admin() THEN
    RAISE EXCEPTION 'Only an administrator can change profile roles';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER prevent_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

CREATE OR REPLACE FUNCTION public.protect_housing_review_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.owner_id = auth.uid()
    AND NOT public.is_skoollhub_admin()
    AND (
      NEW.owner_id IS DISTINCT FROM OLD.owner_id
      OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
      OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
      OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
    ) THEN
    RAISE EXCEPTION 'Only an administrator or payment processor can change listing review fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_housing_review_fields ON public.houses;
CREATE TRIGGER protect_housing_review_fields
  BEFORE UPDATE ON public.houses
  FOR EACH ROW EXECUTE FUNCTION public.protect_housing_review_fields();

DROP POLICY IF EXISTS "Anyone can view available houses" ON public.houses;
DROP POLICY IF EXISTS "Students can view available housing" ON public.houses;
CREATE POLICY "Students can view available housing"
  ON public.houses FOR SELECT TO authenticated
  USING (is_available = TRUE OR owner_id = auth.uid() OR public.is_skoollhub_admin());

DROP POLICY IF EXISTS "Students can delete their roommate profile" ON public.roommate_profiles;
CREATE POLICY "Students can delete their roommate profile"
  ON public.roommate_profiles FOR DELETE TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students manage their planner tasks" ON public.planner_tasks;
CREATE POLICY "Students manage their planner tasks"
  ON public.planner_tasks FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Signed-in students can read course materials" ON public.course_materials;
CREATE POLICY "Signed-in students can read course materials"
  ON public.course_materials FOR SELECT TO authenticated
  USING (
    uploader_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.school_id = course_materials.school_id
    )
  );
DROP POLICY IF EXISTS "Students can share course materials" ON public.course_materials;
CREATE POLICY "Students can share course materials"
  ON public.course_materials FOR INSERT TO authenticated
  WITH CHECK (uploader_id = auth.uid());
DROP POLICY IF EXISTS "Uploaders can update their materials" ON public.course_materials;
CREATE POLICY "Uploaders can update their materials"
  ON public.course_materials FOR UPDATE TO authenticated
  USING (uploader_id = auth.uid())
  WITH CHECK (uploader_id = auth.uid());
DROP POLICY IF EXISTS "Uploaders can remove their materials" ON public.course_materials;
CREATE POLICY "Uploaders can remove their materials"
  ON public.course_materials FOR DELETE TO authenticated
  USING (uploader_id = auth.uid());

DROP POLICY IF EXISTS "Students can read active subscription plans" ON public.subscription_plans;
CREATE POLICY "Students can read active subscription plans"
  ON public.subscription_plans FOR SELECT TO authenticated
  USING (is_active = TRUE OR public.is_skoollhub_admin());
DROP POLICY IF EXISTS "Admins manage subscription plans" ON public.subscription_plans;
CREATE POLICY "Admins manage subscription plans"
  ON public.subscription_plans FOR ALL TO authenticated
  USING (public.is_skoollhub_admin())
  WITH CHECK (public.is_skoollhub_admin());

DROP POLICY IF EXISTS "Students can view their subscriptions" ON public.user_subscriptions;
CREATE POLICY "Students can view their subscriptions"
  ON public.user_subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_skoollhub_admin());
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can manage subscriptions"
  ON public.user_subscriptions FOR ALL TO authenticated
  USING (public.is_skoollhub_admin())
  WITH CHECK (public.is_skoollhub_admin());

DROP POLICY IF EXISTS "Students can view their payment history" ON public.payments;
CREATE POLICY "Students can view their payment history"
  ON public.payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_skoollhub_admin());
DROP POLICY IF EXISTS "Students can start their own payments" ON public.payments;
CREATE POLICY "Students can start their own payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "Students can view their own contact unlocks" ON public.housing_contact_unlocks;
CREATE POLICY "Students can view their own contact unlocks"
  ON public.housing_contact_unlocks FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can review and verify housing listings" ON public.houses;
CREATE POLICY "Admins can review and verify housing listings"
  ON public.houses FOR UPDATE TO authenticated
  USING (public.is_skoollhub_admin())
  WITH CHECK (public.is_skoollhub_admin());

DROP POLICY IF EXISTS "Students manage their own timetables" ON public.timetables;
DROP POLICY IF EXISTS "Users view own timetables" ON public.timetables;
DROP POLICY IF EXISTS "Users edit own timetables" ON public.timetables;
CREATE POLICY "Students manage their own timetables"
  ON public.timetables FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students view their timetable classes" ON public.classes;
CREATE POLICY "Students view their timetable classes"
  ON public.classes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.timetables AS timetable
      WHERE timetable.id = classes.timetable_id
        AND timetable.student_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Students add classes to their timetables" ON public.classes;
CREATE POLICY "Students add classes to their timetables"
  ON public.classes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.timetables AS timetable
      WHERE timetable.id = classes.timetable_id
        AND timetable.student_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Students update their timetable classes" ON public.classes;
CREATE POLICY "Students update their timetable classes"
  ON public.classes FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.timetables AS timetable
      WHERE timetable.id = classes.timetable_id
        AND timetable.student_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.timetables AS timetable
      WHERE timetable.id = classes.timetable_id
        AND timetable.student_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Students delete their timetable classes" ON public.classes;
CREATE POLICY "Students delete their timetable classes"
  ON public.classes FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.timetables AS timetable
      WHERE timetable.id = classes.timetable_id
        AND timetable.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "SkoollHub users can view uploaded files" ON storage.objects;
CREATE POLICY "SkoollHub users can view uploaded files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'message-attachments');
DROP POLICY IF EXISTS "SkoollHub users upload to their folder" ON storage.objects;
CREATE POLICY "SkoollHub users upload to their folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND (storage.foldername(name))[2] = auth.uid()::TEXT
  );
DROP POLICY IF EXISTS "SkoollHub users update their files" ON storage.objects;
CREATE POLICY "SkoollHub users update their files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'message-attachments'
    AND (storage.foldername(name))[2] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND (storage.foldername(name))[2] = auth.uid()::TEXT
  );
DROP POLICY IF EXISTS "SkoollHub users delete their files" ON storage.objects;
CREATE POLICY "SkoollHub users delete their files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'message-attachments'
    AND (storage.foldername(name))[2] = auth.uid()::TEXT
  );
