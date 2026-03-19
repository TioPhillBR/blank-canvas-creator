
-- Create pending_invites table to track invited users and their intended roles
CREATE TABLE public.pending_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'employee',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ,
  UNIQUE(email)
);

ALTER TABLE public.pending_invites ENABLE ROW LEVEL SECURITY;

-- Only admins can manage invites
CREATE POLICY "Admins can view invites"
  ON public.pending_invites FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert invites"
  ON public.pending_invites FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invites"
  ON public.pending_invites FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invites"
  ON public.pending_invites FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to auto-assign role when a new user signs up (if they have a pending invite)
CREATE OR REPLACE FUNCTION public.handle_invite_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Check if the new user's email has a pending invite
  SELECT * INTO invite_record
  FROM public.pending_invites
  WHERE email = NEW.email AND used_at IS NULL
  LIMIT 1;

  IF FOUND THEN
    -- Assign the role from the invite
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, invite_record.role)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Mark invite as used
    UPDATE public.pending_invites
    SET used_at = now()
    WHERE id = invite_record.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on new user creation to check invites
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invite_role_assignment();
