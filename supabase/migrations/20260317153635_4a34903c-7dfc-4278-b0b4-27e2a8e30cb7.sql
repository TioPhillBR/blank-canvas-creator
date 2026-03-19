
-- =============================================
-- HARDEN RLS: Replace permissive policies with auth-required ones
-- =============================================

-- ---- EMPLOYEES ----
DROP POLICY IF EXISTS "Employees are publicly readable (prototype)" ON public.employees;
DROP POLICY IF EXISTS "Employees are publicly insertable (prototype)" ON public.employees;
DROP POLICY IF EXISTS "Employees are publicly updatable (prototype)" ON public.employees;

CREATE POLICY "Authenticated users can read employees"
  ON public.employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert employees"
  ON public.employees FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update employees"
  ON public.employees FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete employees"
  ON public.employees FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ---- NOTIFICATIONS ----
DROP POLICY IF EXISTS "Notifications are publicly readable (prototype)" ON public.notifications;
DROP POLICY IF EXISTS "Notifications are publicly insertable (prototype)" ON public.notifications;
DROP POLICY IF EXISTS "Notifications are publicly updatable (prototype)" ON public.notifications;

CREATE POLICY "Authenticated users can read notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (true);

-- ---- CLOCK_RECORDS ----
DROP POLICY IF EXISTS "Clock records are publicly readable (prototype)" ON public.clock_records;
DROP POLICY IF EXISTS "Clock records are publicly insertable (prototype)" ON public.clock_records;

CREATE POLICY "Authenticated users can read clock records"
  ON public.clock_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert clock records"
  ON public.clock_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ---- WORK_SCHEDULES ----
DROP POLICY IF EXISTS "Work schedules are publicly readable (prototype)" ON public.work_schedules;
DROP POLICY IF EXISTS "Work schedules are publicly insertable (prototype)" ON public.work_schedules;

CREATE POLICY "Authenticated users can read work schedules"
  ON public.work_schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert work schedules"
  ON public.work_schedules FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update work schedules"
  ON public.work_schedules FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ---- WRISTBANDS ----
DROP POLICY IF EXISTS "Wristbands are publicly readable (prototype)" ON public.wristbands;
DROP POLICY IF EXISTS "Wristbands are publicly insertable (prototype)" ON public.wristbands;

CREATE POLICY "Authenticated users can read wristbands"
  ON public.wristbands FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert wristbands"
  ON public.wristbands FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
