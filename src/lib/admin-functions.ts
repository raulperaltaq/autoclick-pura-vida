"use server";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { z } from "zod";

const updateStatusSchema = z.object({
  listingId: z.string().uuid(),
  status: z.enum(["pending_review", "published", "rejected", "paused", "sold"]),
});

const bulkUpdateSchema = z.object({
  listingIds: z.array(z.string().uuid()).min(1),
  status: z.enum(["pending_review", "published", "rejected", "paused", "sold"]),
});

function checkAdminConfig(): void {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Admin operations require SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables. " +
      "Configure them in your hosting platform (Lovable Cloud, Cloudflare, etc.) or in a local .env file."
    );
  }
}

export async function adminUpdateListingStatus(input: {
  listingId: string;
  status: "pending_review" | "published" | "rejected" | "paused" | "sold";
}) {
  checkAdminConfig();
  const { listingId, status } = updateStatusSchema.parse(input);

  const updates: TablesUpdate<"listings"> = { status };

  if (status === "published") {
    updates.published_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin.from("listings").update(updates).eq("id", listingId);

  if (error) {
    console.error("Could not update listing status:", error);
    throw new Error("No se pudo actualizar el estado del anuncio.");
  }

  return { success: true };
}

export async function adminBulkUpdateListingStatus(input: {
  listingIds: string[];
  status: "pending_review" | "published" | "rejected" | "paused" | "sold";
}) {
  checkAdminConfig();
  const { listingIds, status } = bulkUpdateSchema.parse(input);

  const updates: TablesUpdate<"listings"> = { status };

  if (status === "published") {
    updates.published_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin.from("listings").update(updates).in("id", listingIds);

  if (error) {
    console.error("Could not bulk update listing status:", error);
    throw new Error("No se pudieron actualizar los estados.");
  }

  return { success: true, count: listingIds.length };
}

export async function adminUpdateListing(input: {
  listingId: string;
  updates: Partial<{
    make: string;
    model: string;
    year: number;
    price: number;
    currency: "CRC" | "USD";
    km: number | null;
    fuel: string;
    transmission: string;
    body: string;
    province: string;
    style: string;
    condition: string;
    doors: number | null;
    financing: boolean | null;
    trade: boolean | null;
    seller: string;
    phone: string;
    description: string;
    details: Record<string, string | string[]>;
    plan: string;
    requested_plan: string;
    whatsapp_enabled: boolean;
  }>;
}) {
  checkAdminConfig();
  const { listingId, updates } = input;

  const { error } = await supabaseAdmin.from("listings").update(updates).eq("id", listingId);

  if (error) {
    console.error("Could not update listing:", error);
    throw new Error("No se pudo actualizar el anuncio.");
  }

  return { success: true };
}
