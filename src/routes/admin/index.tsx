import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllListingsForAdmin,
  updateListingStatus,
} from "@/data/listings-repository";
import { AuthOnly } from "@/components/auth-only";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  RefreshCw,
  Truck,
  X,
  CheckCircle2,
  Eye,
  Edit3,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Panel de Administración | autoclick.cr" },
      {
        name: "description",
        content: "Revisá, aprobá o rechazá anuncios de vehículos en autoclick.cr.",
      },
    ],
  }),
  component: AdminPage,
});

const statusLabels: Record<string, { label: string; variant: string }> = {
  pending_review: { label: "Pendiente", variant: "warning" },
  published: { label: "Publicado", variant: "success" },
  rejected: { label: "Rechazado", variant: "destructive" },
  paused: { label: "Pausado", variant: "secondary" },
  sold: { label: "Vendido", variant: "primary" },
};

function AdminPage() {
  const { profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isConfirming, setIsConfirming] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    listingId: string;
    status: string;
  } | null>(null);

  const listingsQuery = useQuery({
    queryKey: ["admin-listings", statusFilter],
    queryFn: fetchAllListingsForAdmin,
  });

  const listings = useMemo(
    () =>
      listingsQuery.data?.filter(
        (l) => statusFilter === "all" || l.status === statusFilter,
      ) ?? [],
    [listingsQuery.data, statusFilter],
  );

  const counts = useMemo(() => {
    const data = listingsQuery.data ?? [];
    return {
      all: data.length,
      pending_review: data.filter((l) => l.status === "pending_review").length,
      published: data.filter((l) => l.status === "published").length,
      rejected: data.filter((l) => l.status === "rejected").length,
      paused: data.filter((l) => l.status === "paused").length,
      sold: data.filter((l) => l.status === "sold").length,
    };
  }, [listingsQuery.data]);

  const handleApprove = useCallback(
    async (listingId: string) => {
      setConfirmAction({ listingId, status: "published" });
    },
    [],
  );

  const handleReject = useCallback(
    async (listingId: string) => {
      setConfirmAction({ listingId, status: "rejected" });
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (!confirmAction) return;
    setIsConfirming(confirmAction.listingId);
    try {
      await updateListingStatus(
        confirmAction.listingId,
        confirmAction.status as
          | "pending_review"
          | "published"
          | "rejected"
          | "paused"
          | "sold",
      );
      setConfirmAction(null);
      setIsConfirming(null);
    } catch (error) {
      setIsConfirming(null);
      console.error("Error updating listing:", error);
    }
  }, [confirmAction]);

  const handleCancel = useCallback(() => {
    setConfirmAction(null);
    setIsConfirming(null);
  }, []);

  return (
    <AuthOnly allowedRoles={["admin"]}>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">
              Panel de Administración
            </p>
            <h1 className="mt-1 text-3xl font-extrabold">Gestión de Anuncios</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Bienvenido{profile?.fullName ? `, ${profile.fullName}` : ""}{" "}
              {profile?.email && (
                <>
                  {profile.fullName ? "" : ""}
                  <span>({profile.email})</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => void listingsQuery.refetch()}
              disabled={listingsQuery.isPending}
              className="flex items-center gap-2"
            >
              {listingsQuery.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Actualizar
            </Button>
          </div>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { id: "all", label: "Total", count: counts.all },
            { id: "pending_review", label: "Pendientes", count: counts.pending_review },
            { id: "published", label: "Publicados", count: counts.published },
            { id: "rejected", label: "Rechazados", count: counts.rejected },
            { id: "paused", label: "Pausados", count: counts.paused },
          ].map((stat) => {
            const isActive = statusFilter === stat.id;
            return (
              <a key={stat.id} onClick={() => setStatusFilter(stat.id)}
                className={`rounded-xl border p-4 flex flex-col gap-2 transition ${isActive
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card hover:bg-muted hover:text-primary"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{stat.label}</span>
                  <span className={`text-xs font-bold ${isActive ? "" : "opacity-50"}`}>{stat.count}</span>
                </div>
              </a>
            );
          })}
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-muted p-4 flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap sm:justify-start">
            <span className="text-sm font-semibold text-muted-foreground">
              {listings.length} anuncio{listings.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filtrar por estado:</span>
              <div className="flex gap-1">
                {[
                  { id: "pending_review", label: "Pendientes" },
                  { id: "published", label: "Publicados" },
                  { id: "rejected", label: "Rechazados" },
                  { id: "paused", label: "Pausados" },
                  { id: "sold", label: "Vendidos" },
                ].map((s) => (
                  <button key={s.id} onClick={() => setStatusFilter(s.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${statusFilter === s.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {listingsQuery.isError ? (
            <div className="py-20 text-center">
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="text-sm font-semibold text-destructive">
                  Error al cargar anuncios
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {listingsQuery.error instanceof Error
                    ? listingsQuery.error.message
                    : "No se pudieron cargar los anuncios."}
                </p>
                <Button
                  type="button"
                  onClick={() => void listingsQuery.refetch()}
                  className="mt-4 inline-flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Reintentar
                </Button>
              </div>
            </div>
          ) : listingsQuery.isPending ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Cargando anuncios…
              </p>
            </div>
          ) : listings.length === 0 ? (
            <div className="py-20 text-center">
              <Truck className="mx-auto h-10 w-10 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-bold">
                No hay anuncios con este estado
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Cambiá el filtro a "Todos" o revisá más tarde.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {listings.map((listing) => {
                const status = statusLabels[listing.status] ?? {
                  label: listing.status,
                  variant: "secondary",
                };
                return (
                  <div key={listing.id}
                    className="p-4 flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:justify-start hover:bg-muted/50 transition">
                    <div className="flex items-center gap-4 sm:min-w-[45%]">
                      {listing.image_url ? (
                        <img src={listing.image_url}
                          alt={`${listing.make} ${listing.model}`}
                          className="aspect-[4/3] w-20 h-20 rounded-xl object-cover sm:w-24 sm:h-24" />
                      ) : (
                        <div className="flex aspect-[4/3] w-20 h-20 items-center justify-center rounded-xl bg-muted sm:w-24 sm:h-24">
                          <Truck className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <Link to={"/admin/anuncios/$id" as any} params={{ id: listing.id }}
                          className="font-semibold text-foreground hover:text-primary">
                          {listing.make} {listing.model} {listing.year}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground truncate sm:max-w-xs">
                          {listing.province} · {listing.fuel} · {listing.transmission}
                        </p>
                        <p className="mt-1 text-sm font-bold">
                          {new Intl.NumberFormat("es-CR", {
                            style: "currency",
                            currency: listing.currency,
                            maximumFractionDigits: 0,
                          }).format(listing.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:w-auto">
                      <Badge variant={status.variant as any}>
                        {status.label}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Link
                          to="/admin/anuncios/$id"
                          params={{ id: String(listing.id) }}
                          className="text-xs font-semibold text-primary hover:underline">
                          <Eye className="h-3 w-3 mr-1" /> Ver
                        </Link>
                        {confirmAction?.listingId === listing.id ? (
                          <>
                            <button onClick={() => handleConfirm()}
                              disabled={isConfirming === listing.id}
                              className={`text-xs font-bold px-2 py-1 rounded transition ${isConfirming === listing.id
                                ? "opacity-50 cursor-not-allowed"
                                : listing.status === "published"
                                  ? "text-success hover:bg-success/10"
                                  : "text-destructive hover:bg-destructive/10"
                              }`}>
                              {isConfirming === listing.id ? "Procesando…"
                                : listing.status === "published" ? "Confirmar Aprobar" : "Confirmar Rechazar"}
                            </button>
                            <button onClick={handleCancel}
                              className="text-xs font-bold text-muted-foreground px-2 py-1 rounded hover:bg-muted">
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleApprove(listing.id)}
                              className="text-xs font-bold text-success px-2 py-1 rounded hover:bg-success/10">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Aprobar
                            </button>
                            <button onClick={() => handleReject(listing.id)}
                              className="text-xs font-bold text-destructive px-2 py-1 rounded hover:bg-destructive/10">
                              <X className="h-3 w-3 mr-1" /> Rechazar
                            </button>
                          </>
                        )}
                        <Link
                          to="/admin/anuncios/$id"
                          params={{ id: String(listing.id) }}
                          className="text-xs font-semibold text-primary hover:underline">
                          <Edit3 className="h-3 w-3 mr-1" /> Editar
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </AuthOnly>
  );
}