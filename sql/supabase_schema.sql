-- supabase_schema.sql
-- Script para crear las tablas y políticas recomendadas para tu proyecto.
-- Ejecuta este script en el SQL editor de Supabase (o pégalo en una migración).

-- Habilitar extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de perfiles (se usará con auth.users.id como FK)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  nombre text,
  edad integer,
  institucion text,
  grado text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- Tabla para almacenar registros de participantes (formularios), independiente de auth
CREATE TABLE IF NOT EXISTS public.participant_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  nombre text,
  edad integer,
  institucion text,
  grado text,
  created_at timestamptz DEFAULT now()
);

-- Trigger: cuando se crea un usuario en auth.users, crear perfil básico en public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) y políticas recomendadas
-- Perfiles: permitir lectura/escritura solo al propio usuario autenticado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Registros de participantes: permitir inserciones públicas (si quieres aceptar formularios sin auth)
ALTER TABLE public.participant_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_insert_registration ON public.participant_registrations
  FOR INSERT USING (true);

-- Si quieres que solo usuarios autenticados puedan ver las inscripciones:
CREATE POLICY select_registration_for_auth ON public.participant_registrations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Recomendaciones:
-- 1) Si tu proyecto exige verificación por email al crear usuarios, el trigger garantiza
--    que exista un registro en `profiles` cuando el usuario confirme y la fila en auth.users se cree.
-- 2) Si necesitas operaciones administrativas (consultas masivas), crea roles/funciones
--    o usa la "service_role" key en un entorno seguro (no en cliente).
-- 3) Revisa y ajusta políticas RLS según tu modelo de seguridad.

-- Ejemplo: consulta para verificar la estructura
-- SELECT * FROM public.profiles LIMIT 10;
