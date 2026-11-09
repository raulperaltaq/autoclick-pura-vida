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
the Supabase project URL and publishable/anon key. The browser client accepts
`VITE_SUPABASE_PUBLISHABLE_KEY` (preferred) or the legacy
`VITE_SUPABASE_ANON_KEY`. Never put a Supabase `service_role` key in a `VITE_`
variable or browser code.

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

### Vehicle listing storage

The app reads published vehicles from a Lovable-managed `public.listings` table.
Each published row needs the fields consumed by `src/data/listings-repository.ts`,
including `plan` and nullable-until-publication `published_at`. The seller form
uploads photos to the public-read `listing-images` Storage bucket and inserts
authenticated submissions with `status = 'pending_review'`, `plan = 'free'`,
and the selected tier in `requested_plan`. This keeps a requested paid tier
from gaining priority before its benefits are actually approved or paid for.

Configure the table, Storage bucket, and row-level security in the Lovable
editor. Public users should only read published listings; authenticated
accounts may submit their own pending listings, and only trusted approval or
payment logic should set the active plan and `published_at`. Storage uploads
should be restricted to the authenticated user's folder and supported image
types. Regenerate Supabase types from the managed schema after it is configured;
do not edit generated types or repository migrations by hand. When there are no
published database listings, the built-in sample vehicles remain available.

The listing repository expects these `public.listings` columns: `id`,
`owner_id`, `make`, `model`, `year`, `price`, `currency`, `km`, `fuel`,
`transmission`, `body`, `province`, `style`, `condition`, `doors`, `financing`,
`trade`, `image_url`, `image_urls`, `plan`, `requested_plan`, `published_at`,
`status`, `seller`, `phone`, `description`, and `details`. Use UUIDs for IDs,
`numeric` for price, `text[]` for image URLs, `jsonb` for details, and a
`timestamptz` publication date. Allow the plan values `free`, `featured`,
`premium`, and `premium-plus`; statuses include `pending_review` and
`published`. New submissions should default to `plan = 'free'`,
`status = 'pending_review'`, and `published_at = NULL`. The form requires an
authenticated owner. RLS must enforce `owner_id = auth.uid()` on inserts and
keep plan activation and publication approval restricted to trusted logic.
