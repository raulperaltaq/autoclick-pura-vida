INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  '0f5ce84e-7837-4406-ac2f-164f7f53339f'::uuid,
  'authenticated',
  'authenticated',
  'seller.demo@autoclick.cr',
  crypt('AutoClick123!', gen_salt('bf')),
  now(),
  now(),
  '{"provider":"email"}'::jsonb,
  '{"full_name":"Vendedor Demo","requested_role":"seller"}'::jsonb,
  false,
  now(),
  now(),
  false,
  false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  '11e7ac3f-5749-4c59-a3fc-9cb40e8c79f8'::uuid,
  'authenticated',
  'authenticated',
  'agencia.demo@autoclick.cr',
  crypt('AutoClick123!', gen_salt('bf')),
  now(),
  now(),
  '{"provider":"email"}'::jsonb,
  '{"full_name":"Agencia Demo","requested_role":"agency"}'::jsonb,
  false,
  now(),
  now(),
  false,
  false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'ec12e587-da3d-47bf-b2a7-0d0d0d181f2a'::uuid,
  'authenticated',
  'authenticated',
  'admin.demo@autoclick.cr',
  crypt('AutoClick123!', gen_salt('bf')),
  now(),
  now(),
  '{"provider":"email"}'::jsonb,
  '{"full_name":"Administrador Demo","requested_role":"admin"}'::jsonb,
  false,
  now(),
  now(),
  false,
  false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, avatar_url, phone, preferences)
VALUES
  ('0f5ce84e-7837-4406-ac2f-164f7f53339f'::uuid, 'Vendedor Demo', '', '', '{}')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

INSERT INTO public.profiles (id, full_name, avatar_url, phone, preferences)
VALUES
  ('11e7ac3f-5749-4c59-a3fc-9cb40e8c79f8'::uuid, 'Agencia Demo', '', '', '{}')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

INSERT INTO public.profiles (id, full_name, avatar_url, phone, preferences)
VALUES
  ('ec12e587-da3d-47bf-b2a7-0d0d0d181f2a'::uuid, 'Administrador Demo', '', '', '{}')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

DELETE FROM public.user_roles WHERE user_id IN ('11e7ac3f-5749-4c59-a3fc-9cb40e8c79f8'::uuid, 'ec12e587-da3d-47bf-b2a7-0d0d0d181f2a'::uuid) AND role='seller';
INSERT INTO public.user_roles (user_id, role) VALUES
  ('11e7ac3f-5749-4c59-a3fc-9cb40e8c79f8'::uuid, 'agency')
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role) VALUES
  ('ec12e587-da3d-47bf-b2a7-0d0d0d181f2a'::uuid, 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO public.agencies (owner_id, name, phone)
VALUES ('11e7ac3f-5749-4c59-a3fc-9cb40e8c79f8'::uuid, 'Agencia Demo', '+506 8888-0000')
ON CONFLICT DO NOTHING;

INSERT INTO public.agency_members (agency_id, user_id, member_role)
SELECT id, '11e7ac3f-5749-4c59-a3fc-9cb40e8c79f8'::uuid, 'owner'
FROM public.agencies
WHERE owner_id = '11e7ac3f-5749-4c59-a3fc-9cb40e8c79f8'::uuid
ON CONFLICT DO NOTHING;
