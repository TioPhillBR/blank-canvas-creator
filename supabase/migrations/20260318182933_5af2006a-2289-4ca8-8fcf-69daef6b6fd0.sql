
-- Departments table
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage departments" ON public.departments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Positions table
CREATE TABLE public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read positions" ON public.positions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage positions" ON public.positions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Institutional sections table
CREATE TABLE public.institutional_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  icon text DEFAULT 'Building2',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.institutional_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read institutional sections" ON public.institutional_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage institutional sections" ON public.institutional_sections FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add delete policy for work_schedules
CREATE POLICY "Admins can delete work schedules" ON public.work_schedules FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Add update/delete policies for clock_records (admin only)
CREATE POLICY "Admins can update clock records" ON public.clock_records FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete clock records" ON public.clock_records FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
