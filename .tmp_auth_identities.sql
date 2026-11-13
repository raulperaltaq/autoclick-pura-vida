INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '4f2ff4ab-1a2d-4d5d-bb88-dc0d2a93ab38'::uuid,
  '0f5ce84e-7837-4406-ac2f-164f7f53339f',
  '0f5ce84e-7837-4406-ac2f-164f7f53339f'::uuid,
  '{"sub":"0f5ce84e-7837-4406-ac2f-164f7f53339f","email":"seller.demo@autoclick.cr","email_verified":true,"phone_verified":false,"full_name":"Vendedor Demo","requested_role":"seller"}'::jsonb,
  'email',
  now(),
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '2d58c0ec-d9d7-49b7-9d9a-0a6d14a3e531'::uuid,
  '11e7ac3f-5749-4c59-a3fc-9cb40e8c79f8',
  '11e7ac3f-5749-4c59-a3fc-9cb40e8c79f8'::uuid,
  '{"sub":"11e7ac3f-5749-4c59-a3fc-9cb40e8c79f8","email":"agencia.demo@autoclick.cr","email_verified":true,"phone_verified":false,"full_name":"Agencia Demo","requested_role":"agency"}'::jsonb,
  'email',
  now(),
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '48a5a5de-b7b3-4c66-b89a-d9624b3f9f13'::uuid,
  'ec12e587-da3d-47bf-b2a7-0d0d0d181f2a',
  'ec12e587-da3d-47bf-b2a7-0d0d0d181f2a'::uuid,
  '{"sub":"ec12e587-da3d-47bf-b2a7-0d0d0d181f2a","email":"admin.demo@autoclick.cr","email_verified":true,"phone_verified":false,"full_name":"Administrador Demo","requested_role":"admin"}'::jsonb,
  'email',
  now(),
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
