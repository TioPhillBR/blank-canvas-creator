
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

CREATE POLICY "Authenticated users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (employee_id IS NULL OR employee_id IN (
  SELECT e.id FROM public.employees e
  INNER JOIN public.profiles p ON p.employee_id = e.id
  WHERE p.user_id = auth.uid()
) OR has_role(auth.uid(), 'admin'::app_role));
