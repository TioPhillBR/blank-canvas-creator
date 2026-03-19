
-- Add user_id to wristbands to link auth users
ALTER TABLE public.wristbands ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Allow admins to update and delete wristbands
CREATE POLICY "Admins can update wristbands"
  ON public.wristbands FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete wristbands"
  ON public.wristbands FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow the wristband signup route to read wristbands without auth (public SELECT for anon)
-- This is needed so unauthenticated users can verify the wristband code during signup
CREATE POLICY "Anon can read wristbands for signup"
  ON public.wristbands FOR SELECT
  TO anon
  USING (true);

-- Also allow anon to read employees (needed for signup page to show employee name)
CREATE POLICY "Anon can read employees for signup"
  ON public.employees FOR SELECT
  TO anon
  USING (true);
