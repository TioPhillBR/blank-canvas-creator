
-- ==================== EMPLOYEES ====================
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  photo_url TEXT,
  rg TEXT NOT NULL,
  cpf TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin TEXT,
  instagram TEXT,
  blood_type TEXT NOT NULL,
  pre_existing_conditions TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  emergency_contact_relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees are publicly readable (prototype)" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Employees are publicly insertable (prototype)" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Employees are publicly updatable (prototype)" ON public.employees FOR UPDATE USING (true);

-- ==================== WRISTBANDS ====================
CREATE TABLE public.wristbands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wristbands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wristbands are publicly readable (prototype)" ON public.wristbands FOR SELECT USING (true);
CREATE POLICY "Wristbands are publicly insertable (prototype)" ON public.wristbands FOR INSERT WITH CHECK (true);

-- ==================== WORK SCHEDULES ====================
CREATE TYPE public.shift_type AS ENUM ('Manhã', 'Tarde', 'Noite');

CREATE TABLE public.work_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift public.shift_type NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Work schedules are publicly readable (prototype)" ON public.work_schedules FOR SELECT USING (true);
CREATE POLICY "Work schedules are publicly insertable (prototype)" ON public.work_schedules FOR INSERT WITH CHECK (true);

-- ==================== CLOCK RECORDS ====================
CREATE TYPE public.clock_event_type AS ENUM ('entrada', 'saída', 'saída-almoço', 'retorno-almoço');

CREATE TABLE public.clock_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  type public.clock_event_type NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clock_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clock records are publicly readable (prototype)" ON public.clock_records FOR SELECT USING (true);
CREATE POLICY "Clock records are publicly insertable (prototype)" ON public.clock_records FOR INSERT WITH CHECK (true);

-- ==================== NOTIFICATIONS ====================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications are publicly readable (prototype)" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Notifications are publicly insertable (prototype)" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Notifications are publicly updatable (prototype)" ON public.notifications FOR UPDATE USING (true);

-- ==================== UPDATE TRIGGER ====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== SEED DATA ====================
-- 5 realistic employees for Silverado industrial company
INSERT INTO public.employees (id, full_name, rg, cpf, role, department, phone, email, linkedin, instagram, blood_type, pre_existing_conditions, medications, allergies, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship)
VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Carlos Eduardo Silva', '12.345.678-9', '123.456.789-00', 'Operador de Produção', 'Produção', '(11) 99871-2034', 'carlos.silva@silverado.com.br', 'linkedin.com/in/carlos-e-silva', '@carlos.esilva', 'O+', ARRAY['Hipertensão arterial'], ARRAY['Losartana 50mg'], ARRAY['Dipirona'], 'Maria Aparecida Silva', '(11) 98234-5601', 'Esposa'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Ana Paula Ferreira', '98.765.432-1', '987.654.321-00', 'Analista de Qualidade', 'Qualidade', '(11) 99632-4178', 'ana.ferreira@silverado.com.br', 'linkedin.com/in/ana-p-ferreira', NULL, 'A-', '{}', '{}', ARRAY['Penicilina', 'Látex'], 'João Henrique Ferreira', '(11) 97456-3290', 'Pai'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Roberto Almeida Santos', '45.678.901-2', '456.789.012-34', 'Supervisor de Manutenção', 'Manutenção', '(11) 99514-8823', 'roberto.santos@silverado.com.br', NULL, '@roberto.a.santos', 'B+', ARRAY['Diabetes tipo 2'], ARRAY['Metformina 850mg', 'Glicazida 30mg'], '{}', 'Lúcia Helena Santos', '(11) 98102-7745', 'Mãe'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Fernanda Costa Lima', '33.221.445-6', '334.556.778-90', 'Técnica de Segurança do Trabalho', 'Segurança', '(11) 99745-3312', 'fernanda.lima@silverado.com.br', 'linkedin.com/in/fernanda-c-lima', '@fer.costalima', 'AB+', '{}', ARRAY['Levotiroxina 75mcg'], ARRAY['Ibuprofeno'], 'Ricardo Costa Lima', '(11) 97889-4456', 'Irmão'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Marcos Vinícius Oliveira', '56.789.123-4', '567.891.234-56', 'Eletricista Industrial', 'Manutenção', '(11) 99288-6647', 'marcos.oliveira@silverado.com.br', NULL, NULL, 'O-', ARRAY['Asma leve'], ARRAY['Salbutamol spray'], ARRAY['Sulfas', 'Poeira industrial'], 'Juliana Oliveira', '(11) 98567-1123', 'Esposa');

-- Wristbands
INSERT INTO public.wristbands (code, employee_id) VALUES
  ('NFC-SLV-001', 'a1b2c3d4-0001-4000-8000-000000000001'),
  ('NFC-SLV-002', 'a1b2c3d4-0002-4000-8000-000000000002'),
  ('NFC-SLV-003', 'a1b2c3d4-0003-4000-8000-000000000003'),
  ('NFC-SLV-004', 'a1b2c3d4-0004-4000-8000-000000000004'),
  ('NFC-SLV-005', 'a1b2c3d4-0005-4000-8000-000000000005');

-- Work schedules for current week (2026-03-16 to 2026-03-22)
INSERT INTO public.work_schedules (employee_id, date, shift, start_time, end_time) VALUES
  -- Carlos - Manhã full week
  ('a1b2c3d4-0001-4000-8000-000000000001', '2026-03-16', 'Manhã', '06:00', '14:00'),
  ('a1b2c3d4-0001-4000-8000-000000000001', '2026-03-17', 'Manhã', '06:00', '14:00'),
  ('a1b2c3d4-0001-4000-8000-000000000001', '2026-03-18', 'Manhã', '06:00', '14:00'),
  ('a1b2c3d4-0001-4000-8000-000000000001', '2026-03-19', 'Manhã', '06:00', '14:00'),
  ('a1b2c3d4-0001-4000-8000-000000000001', '2026-03-20', 'Manhã', '06:00', '14:00'),
  -- Ana - Tarde
  ('a1b2c3d4-0002-4000-8000-000000000002', '2026-03-16', 'Tarde', '14:00', '22:00'),
  ('a1b2c3d4-0002-4000-8000-000000000002', '2026-03-17', 'Tarde', '14:00', '22:00'),
  ('a1b2c3d4-0002-4000-8000-000000000002', '2026-03-18', 'Manhã', '06:00', '14:00'),
  ('a1b2c3d4-0002-4000-8000-000000000002', '2026-03-19', 'Manhã', '06:00', '14:00'),
  ('a1b2c3d4-0002-4000-8000-000000000002', '2026-03-20', 'Tarde', '14:00', '22:00'),
  -- Roberto - Noite
  ('a1b2c3d4-0003-4000-8000-000000000003', '2026-03-16', 'Noite', '22:00', '06:00'),
  ('a1b2c3d4-0003-4000-8000-000000000003', '2026-03-17', 'Noite', '22:00', '06:00'),
  ('a1b2c3d4-0003-4000-8000-000000000003', '2026-03-18', 'Noite', '22:00', '06:00'),
  ('a1b2c3d4-0003-4000-8000-000000000003', '2026-03-19', 'Noite', '22:00', '06:00'),
  ('a1b2c3d4-0003-4000-8000-000000000003', '2026-03-20', 'Noite', '22:00', '06:00'),
  -- Fernanda - Manhã
  ('a1b2c3d4-0004-4000-8000-000000000004', '2026-03-16', 'Manhã', '06:00', '14:00'),
  ('a1b2c3d4-0004-4000-8000-000000000004', '2026-03-17', 'Manhã', '06:00', '14:00'),
  ('a1b2c3d4-0004-4000-8000-000000000004', '2026-03-18', 'Tarde', '14:00', '22:00'),
  ('a1b2c3d4-0004-4000-8000-000000000004', '2026-03-19', 'Tarde', '14:00', '22:00'),
  ('a1b2c3d4-0004-4000-8000-000000000004', '2026-03-20', 'Manhã', '06:00', '14:00'),
  -- Marcos - Tarde/Noite alternando
  ('a1b2c3d4-0005-4000-8000-000000000005', '2026-03-16', 'Tarde', '14:00', '22:00'),
  ('a1b2c3d4-0005-4000-8000-000000000005', '2026-03-17', 'Tarde', '14:00', '22:00'),
  ('a1b2c3d4-0005-4000-8000-000000000005', '2026-03-18', 'Noite', '22:00', '06:00'),
  ('a1b2c3d4-0005-4000-8000-000000000005', '2026-03-19', 'Noite', '22:00', '06:00'),
  ('a1b2c3d4-0005-4000-8000-000000000005', '2026-03-20', 'Tarde', '14:00', '22:00');

-- Clock records - realistic entries for today and yesterday
INSERT INTO public.clock_records (employee_id, date_time, type, latitude, longitude, accuracy) VALUES
  -- Carlos - yesterday complete
  ('a1b2c3d4-0001-4000-8000-000000000001', '2026-03-16T06:02:14-03:00', 'entrada', -23.5505, -46.6333, 12.5),
  ('a1b2c3d4-0001-4000-8000-000000000001', '2026-03-16T10:01:30-03:00', 'saída-almoço', -23.5505, -46.6333, 8.2),
  ('a1b2c3d4-0001-4000-8000-000000000001', '2026-03-16T11:00:45-03:00', 'retorno-almoço', -23.5505, -46.6333, 10.1),
  ('a1b2c3d4-0001-4000-8000-000000000001', '2026-03-16T14:03:22-03:00', 'saída', -23.5505, -46.6333, 9.8),
  -- Carlos - today
  ('a1b2c3d4-0001-4000-8000-000000000001', '2026-03-17T05:58:47-03:00', 'entrada', -23.5508, -46.6330, 11.3),
  -- Ana - yesterday
  ('a1b2c3d4-0002-4000-8000-000000000002', '2026-03-16T13:57:22-03:00', 'entrada', -23.5510, -46.6335, 15.0),
  ('a1b2c3d4-0002-4000-8000-000000000002', '2026-03-16T18:02:10-03:00', 'saída-almoço', -23.5510, -46.6335, 13.5),
  ('a1b2c3d4-0002-4000-8000-000000000002', '2026-03-16T19:00:33-03:00', 'retorno-almoço', -23.5510, -46.6335, 14.2),
  ('a1b2c3d4-0002-4000-8000-000000000002', '2026-03-16T22:01:55-03:00', 'saída', -23.5510, -46.6335, 12.0),
  -- Roberto - yesterday night
  ('a1b2c3d4-0003-4000-8000-000000000003', '2026-03-16T21:55:30-03:00', 'entrada', -23.5502, -46.6340, 10.5),
  -- Fernanda - yesterday
  ('a1b2c3d4-0004-4000-8000-000000000004', '2026-03-16T06:05:11-03:00', 'entrada', -23.5507, -46.6332, 9.0),
  ('a1b2c3d4-0004-4000-8000-000000000004', '2026-03-16T10:00:44-03:00', 'saída-almoço', -23.5507, -46.6332, 11.7),
  ('a1b2c3d4-0004-4000-8000-000000000004', '2026-03-16T10:58:20-03:00', 'retorno-almoço', -23.5507, -46.6332, 10.3),
  ('a1b2c3d4-0004-4000-8000-000000000004', '2026-03-16T14:01:05-03:00', 'saída', -23.5507, -46.6332, 8.9),
  -- Fernanda - today
  ('a1b2c3d4-0004-4000-8000-000000000004', '2026-03-17T06:03:28-03:00', 'entrada', -23.5509, -46.6331, 12.1),
  -- Marcos - yesterday tarde
  ('a1b2c3d4-0005-4000-8000-000000000005', '2026-03-16T14:04:15-03:00', 'entrada', -23.5504, -46.6338, 14.8),
  ('a1b2c3d4-0005-4000-8000-000000000005', '2026-03-16T18:00:20-03:00', 'saída-almoço', -23.5504, -46.6338, 13.0),
  ('a1b2c3d4-0005-4000-8000-000000000005', '2026-03-16T19:02:40-03:00', 'retorno-almoço', -23.5504, -46.6338, 11.5),
  ('a1b2c3d4-0005-4000-8000-000000000005', '2026-03-16T22:00:10-03:00', 'saída', -23.5504, -46.6338, 10.0);

-- Notifications
INSERT INTO public.notifications (employee_id, title, message, date_time, read) VALUES
  (NULL, 'Manutenção programada no sistema', 'O sistema Feel One ficará indisponível no dia 20/03 das 02h às 04h para manutenção preventiva nos servidores. Pedimos desculpas pelo inconveniente.', '2026-03-16T10:00:00-03:00', false),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Exame periódico agendado', 'Seu exame periódico está agendado para 25/03 às 09h no ambulatório da unidade. Apresente-se em jejum de 12 horas.', '2026-03-15T08:30:00-03:00', false),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Treinamento NR-35 obrigatório', 'Você está inscrita no treinamento de Trabalho em Altura (NR-35) no dia 22/03 às 14h no auditório principal. Presença obrigatória.', '2026-03-14T11:00:00-03:00', true),
  (NULL, 'Novo convênio odontológico', 'A Silverado firmou parceria com a OdontoPlus. O novo convênio odontológico está disponível a partir de abril. Consulte o RH para adesão.', '2026-03-13T09:00:00-03:00', false),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Revisão de equipamentos pendente', 'Favor realizar a inspeção do compressor da linha 3 até sexta-feira. O relatório deve ser enviado ao coordenador.', '2026-03-15T14:20:00-03:00', false),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Atualização de ASO', 'Seu Atestado de Saúde Ocupacional (ASO) vence em 30 dias. Agende o exame na clínica conveniada.', '2026-03-12T16:00:00-03:00', true),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Certificação NR-10 aprovada', 'Parabéns! Sua certificação NR-10 foi renovada com sucesso. Válida até março de 2028.', '2026-03-10T10:00:00-03:00', true),
  (NULL, 'SIPAT 2026 - Inscrições abertas', 'As inscrições para a Semana Interna de Prevenção de Acidentes (SIPAT) já estão abertas. Participe das atividades de 07 a 11 de abril.', '2026-03-11T08:00:00-03:00', false);
