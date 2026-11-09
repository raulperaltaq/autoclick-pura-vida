import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/session-provider";
import { ListingCard } from "@/components/listing-card";
import { listings } from "@/data/listings";
import { accountHead } from "@/lib/account";
export const Route = createFileRoute("/_authenticated/favoritos")({head:()=>accountHead("Favoritos", "Los vehículos que guardaste en autoclick.cr."), component: Favorites});
function Favorites(){const {user}=useSession(); const query=useQuery({queryKey:["favorites",user?.id],enabled:!!user,queryFn:async()=>{if(!user)return []; const r=await supabase.from("favorites").select("listing_id").eq("user_id",user.id); if(r.error)throw r.error;return r.data.map(x=>x.listing_id);}}); const saved=listings.filter(l=>query.data?.includes(l.id));return <main className="mx-auto max-w-6xl px-4 py-12"><h1 className="text-3xl font-extrabold">Favoritos</h1>{query.isError?<p role="alert" className="mt-6 text-destructive">No se pudieron cargar tus favoritos.</p>:query.isPending?<p className="mt-6">Cargando…</p>:saved.length?<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{saved.map(l=><ListingCard key={l.id} listing={l}/>)}</div>:<p className="mt-10 text-muted-foreground">Todavía no guardaste vehículos.</p>}</main>;}