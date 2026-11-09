import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { ReactNode } from "react";
import { provinces } from "@/data/listings";

export const Route = createFileRoute("/vender")({
  head: () => ({
    meta: [
      { title: "Vendé tu carro en Costa Rica | autoclick.cr" },
      { name: "description", content: "Publicá tu vehículo y contactá directamente con compradores en Costa Rica." },
      { property: "og:title", content: "Vendé tu carro | autoclick.cr" },
      { property: "og:description", content: "Publicá gratis en menos de 2 minutos." },
    ],
  }),
  component: Vender,
});

const field = "w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring";

function RequiredMark() {
  return <span aria-hidden="true" className="ml-1 text-destructive">*</span>;
}

function Field({
  label,
  required = false,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`grid gap-1.5 text-sm font-semibold ${className}`}>
      <span>
        {label}
        {required && <RequiredMark />}
      </span>
      {children}
    </label>
  );
}

function Vender() {
  const [photoCount, setPhotoCount] = useState(0);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-extrabold">Vendé tu vehículo</h1>
      <p className="mt-2 text-muted-foreground">Publicá gratis y contactá directamente con compradores.</p>
      <p className="mt-3 text-sm text-muted-foreground">
        Los campos marcados con <RequiredMark /> son obligatorios.
      </p>
      <p role="status" className="mt-4 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        La publicación estará disponible cuando se active el almacenamiento compartido. Los anuncios se publicarán sin revisión de la plataforma.
      </p>
      <form onSubmit={(e) => e.preventDefault()} className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field label="Marca" required>
          <input required placeholder="Ej. Toyota" className={field} />
        </Field>
        <Field label="Modelo" required>
          <input required placeholder="Ej. RAV4" className={field} />
        </Field>
        <Field label="Año">
          <input type="number" min={1980} max={new Date().getFullYear() + 1} placeholder="Año" className={field} />
        </Field>
        <Field label="Kilometraje">
          <input type="number" min={0} placeholder="Kilometraje" className={field} />
        </Field>
        <Field label="Precio" required>
          <div className="flex gap-2">
            <input required type="number" min={0} step="0.01" placeholder="Precio" className={`${field} min-w-0 flex-1`} />
            <select required aria-label="Moneda del precio" className={`${field} w-36`} defaultValue="CRC">
              <option value="CRC">Colones (₡)</option>
              <option value="USD">Dólares (US$)</option>
            </select>
          </div>
        </Field>
        <Field label="Provincia">
          <select className={field} defaultValue="">
            <option value="">Provincia</option>
            {provinces.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Teléfono" required className="sm:col-span-2">
          <input
            required
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{8}"
            title="Ingresá un número de teléfono de 8 dígitos"
            placeholder="8 dígitos"
            className={field}
          />
        </Field>
        <label className="grid cursor-pointer gap-2 rounded-xl border-2 border-dashed border-border p-6 text-sm text-muted-foreground sm:col-span-2">
          <span className="font-semibold text-foreground">
            Fotos del vehículo<RequiredMark />
          </span>
          <span>Seleccioná entre 2 y 20 fotos.</span>
          <input
            required
            type="file"
            accept="image/*"
            multiple
            aria-label="Fotos del vehículo (obligatorio, mínimo 2)"
            aria-describedby="photo-requirements"
            className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:font-semibold file:text-secondary-foreground"
            onChange={(event) => {
              const count = event.currentTarget.files?.length ?? 0;
              setPhotoCount(count);
              event.currentTarget.setCustomValidity(
                count === 1
                  ? "Seleccioná al menos 2 fotos."
                  : count > 20
                    ? "Podés seleccionar un máximo de 20 fotos."
                    : "",
              );
            }}
          />
          <span id="photo-requirements" aria-live="polite">
            {photoCount === 0
              ? "Aún no seleccionaste fotos."
              : `${photoCount} ${photoCount === 1 ? "foto seleccionada" : "fotos seleccionadas"}.`}
          </span>
        </label>
        <Field label="Descripción" className="sm:col-span-2">
          <textarea rows={4} placeholder="Contá el estado, mantenimientos, extras…" className={field} />
        </Field>
        <button disabled className="cursor-not-allowed rounded-full bg-muted px-6 py-3 font-bold text-muted-foreground sm:col-span-2">Publicar anuncio (próximamente)</button>
      </form>
    </main>
  );
}
