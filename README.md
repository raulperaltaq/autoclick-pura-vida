# Autoclick Pura Vida

crea este sitio para autoclick.cr

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5b673bb6-977b-4ae4-902c-d49186de5a88).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Authentication setup

The app's account flows use Supabase Auth. Copy `.env.example` to `.env` and set
the Supabase project URL and publishable/anon key. Never put a Supabase
`service_role` key in a `VITE_` variable or browser code.

Enable Google, Microsoft (Azure), and Facebook providers in the Supabase
dashboard and allow the app's `/acceder` URL as an authentication redirect.
Sessions are persisted and refreshed by Supabase Auth using the PKCE flow.
The current browser client does not provide an HttpOnly cookie session, so
server-side authorization must not rely on client state; enforce access with
Supabase row-level security. A server-managed HttpOnly cookie integration
requires additional TanStack Start server configuration.

The app expects a Lovable-managed `public.users` table keyed by the Supabase
Auth user ID, with `email`, `full_name`, `role`, and `agency_id` columns. Roles
are `buyer`, `seller`, `agency`, and `admin`; only trusted server-side logic
should assign or elevate roles. Email sign-up supplies `requested_role` user
metadata for a trusted profile trigger to validate. OAuth sign-up expects a
`complete_signup(requested_role)` RPC that verifies the authenticated user,
allows only `seller` or `agency`, and provisions agency membership when needed.
Protect account, favorite, listing, agency, and billing data with row-level
security. Agency inventory, memberships, leads, and billing, plus user
favorites (`favorites.user_id`, `favorites.listing_id`, `favorites.created_at`)
and listings, also require their corresponding Lovable-managed tables and
policies. Favorite rows must be readable, insertable, and deletable only by
their owner. No database migrations are created or edited in this repository.
