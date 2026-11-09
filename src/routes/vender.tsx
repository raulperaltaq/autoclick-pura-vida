import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";
import { provinces } from "@/data/listings";
import { styles } from "@/data/search-options";

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

const field =
  "w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring";
const selectField = `${field} cursor-pointer`;
const extras = [
  "Dirección hidráulica/electroasistida",
  "Cierre central",
  "Asientos eléctricos",
  "Vidrios tintados",
  "Airbags",
  "Vidrios eléctricos",
  "Espejos eléctricos",
  "Alarma",
  "Frenos ABS",
  "Aire acondicionado",
  "Desempañador trasero",
  "Sunroof / techo panorámico",
  "Aros de lujo",
  "Turbo",
  "Tapicería de cuero",
  "Halógenos",
  "Cámara 360°",
  "Android Auto",
  "Cruise Control",
  "Radio USB/AUX",
  "Revisión técnica al día",
  "Control electrónico de estabilidad",
  "Control de descenso",
  "Caja dual",
  "Cámara de retroceso",
  "Sensores de retroceso",
  "Sensores frontales",
  "Control de radio en volante",
  "Volante multifuncional",
  "Climatizador",
  "Asientos con memoria",
  "Retrovisores auto-retractibles",
  "Luces Xenón/Bixenón",
  "Sensor de lluvia",
  "Llave inteligente / Push Start",
  "Apple CarPlay",
  "Computadora de viaje",
  "Volante ajustable",
  "Bluetooth",
];
const tags = [
  "Ganga",
  "Poco kilometraje",
  "Como nuevo",
  "Un solo dueño",
  "Financio",
  "Urge vender",
];
const transmissionOptions = ["Manual", "Automática", "CVT", "Doble embrague"];
const fuelOptions = ["Gasolina", "Diesel", "Híbrido", "Eléctrico"];

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
    <label className={`grid content-start gap-1.5 text-sm font-semibold ${className}`}>
      <span>
        {label}
        {required && <RequiredMark />}
      </span>
      {children}
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function SelectField({
  label,
  options,
  placeholder = "Seleccioná una opción",
  className,
}: {
  label: string;
  options: string[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <select className={selectField} defaultValue="">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

function CheckOption({ label }: { label: string }) {
  return (
    <label className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm font-medium hover:bg-muted/60">
      <input type="checkbox" className="mt-0.5 h-4 w-4 accent-primary" />
      <span>{label}</span>
    </label>
  );
}

function Vender() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [mainPhoto, setMainPhoto] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const photoPreviews = useMemo(
    () => photos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photos],
  );

  useEffect(() => () => photoPreviews.forEach(({ url }) => URL.revokeObjectURL(url)), [photoPreviews]);

  const updatePhotos = (files: FileList | File[]) => {
    const selected = Array.from(files);
    const images = selected.filter((file) => file.type.startsWith("image/"));
    let error = "";

    if (images.length !== selected.length) {
      error = "Solo se permiten archivos de imagen.";
    } else if (images.length < 2) {
      error = "Seleccioná al menos 2 fotos.";
    } else if (images.length > 4) {
      error = "Para un anuncio gratuito, podés seleccionar un máximo de 4 fotos.";
    }

    setPhotos(images.slice(0, 4));
    setMainPhoto(0);
    setPhotoError(error);
    if (fileInput.current) {
      fileInput.current.setCustomValidity(error);
    }
  };

  const onPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    updatePhotos(event.currentTarget.files ?? []);
  };

  const onPhotoDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (!fileInput.current || !files.length) return;

    const transfer = new DataTransfer();
    Array.from(files).forEach((file) => transfer.items.add(file));
    fileInput.current.files = transfer.files;
    updatePhotos(files);
  };

  const removePhoto = (index: number) => {
    const remaining = photos.filter((_, photoIndex) => photoIndex !== index);
    setPhotos(remaining);
    setMainPhoto((current) => (current === index ? 0 : current > index ? current - 1 : current));
    const error = remaining.length < 2 ? "Seleccioná al menos 2 fotos." : "";
    setPhotoError(error);

    if (fileInput.current) {
      const transfer = new DataTransfer();
      remaining.forEach((file) => transfer.items.add(file));
      fileInput.current.files = transfer.files;
      fileInput.current.setCustomValidity(error);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Anuncio gratuito</p>
        <h1 className="mt-2 text-4xl font-extrabold">Publicá tu vehículo</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Completá la información del vehículo y tus datos para que las personas interesadas
          puedan contactarte directamente.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Los campos marcados con <RequiredMark /> son obligatorios.
        </p>
      </header>

      <p role="status" className="mb-6 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        El formulario estará disponible para publicar cuando se active el almacenamiento
        compartido. Los anuncios se publicarán sin revisión de la plataforma.
      </p>

      <form onSubmit={(event) => event.preventDefault()} className="space-y-6">
        <Section title="Información del vehículo" description="Los datos principales que verá quien busque tu vehículo.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Marca" required>
              <input required autoComplete="off" placeholder="Ej. Toyota" className={field} />
            </Field>
            <Field label="Modelo" required>
              <input required autoComplete="off" placeholder="Ej. RAV4" className={field} />
            </Field>
            <Field label="Cilindrada (cc)">
              <input type="number" min={0} placeholder="Ej. 2000" className={field} />
            </Field>
            <SelectField label="Estilo" options={styles} />
            <Field label="Número de pasajeros">
              <input type="number" min={1} max={60} placeholder="Ej. 5" className={field} />
            </Field>
            <Field label="Año">
              <input
                type="number"
                min={1900}
                max={new Date().getFullYear() + 1}
                placeholder="Ej. 2022"
                className={field}
              />
            </Field>
            <SelectField label="Estado" options={["Nuevo", "Usado"]} />
            <Field label="Precio" required>
              <div className="flex gap-2">
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Precio"
                  className={`${field} min-w-0 flex-1`}
                />
                <select
                  aria-label="Moneda del precio"
                  className="w-36 shrink-0 rounded-xl border border-input bg-card px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  defaultValue="CRC"
                >
                  <option value="CRC">Colones (₡)</option>
                  <option value="USD">Dólares (US$)</option>
                </select>
              </div>
            </Field>
            <SelectField label="Precio negociable" options={["Sí", "No"]} />
            <Field label="Color exterior">
              <input placeholder="Ej. Blanco" className={field} />
            </Field>
            <Field label="Color interior">
              <input placeholder="Ej. Negro" className={field} />
            </Field>
            <SelectField label="Combustible" options={fuelOptions} />
            <Field label="Autonomía (km, para eléctricos)">
              <input type="number" min={0} placeholder="Ej. 450" className={field} />
            </Field>
            <Field label="Batería (kWh, para eléctricos)">
              <input type="number" min={0} step="0.1" placeholder="Ej. 75" className={field} />
            </Field>
            <SelectField label="Transmisión" options={transmissionOptions} />
            <Field label="Kilometraje">
              <input type="number" min={0} placeholder="Ej. 38000" className={field} />
            </Field>
            <SelectField label="Impuestos pagados" options={["Sí", "No"]} />
            <SelectField label="Recibe vehículo" options={["Sí", "No"]} />
            <Field label="Placa">
              <input placeholder="Opcional" className={field} />
            </Field>
            <Field label="Número de puertas">
              <input type="number" min={1} max={10} placeholder="Ej. 4" className={field} />
            </Field>
            <SelectField label="Provincia" options={provinces} />
            <Field label="Cantón">
              <input placeholder="Ej. Escazú" className={field} />
            </Field>
            <Field label="Dueños anteriores">
              <input type="number" min={0} placeholder="Opcional" className={field} />
            </Field>
            <Field label="Consumo promedio (km/l)">
              <input type="number" min={0} step="0.1" placeholder="Opcional" className={field} />
            </Field>
            <Field label="Estado de la batería (para eléctricos)">
              <input placeholder="Ej. 90% de capacidad" className={field} />
            </Field>
            <SelectField label="Financiamiento disponible" options={["Sí", "No"]} />
            <Field label="Garantía">
              <input placeholder="Ej. 1 año" className={field} />
            </Field>
            <SelectField label="Tipo de vendedor" options={["Particular", "Agencia"]} />
            <Field label="Video del vehículo (YouTube)" className="sm:col-span-2">
              <input type="url" placeholder="https://youtube.com/..." className={field} />
            </Field>
            <Field label="Comentario adicional" className="sm:col-span-2">
              <textarea
                rows={4}
                placeholder="Contá el estado, mantenimientos, extras y cualquier detalle importante…"
                className={field}
              />
            </Field>
            <Field label="Historial de mantenimiento" className="sm:col-span-2">
              <textarea rows={3} placeholder="Opcional" className={field} />
            </Field>
          </div>
        </Section>

        <Section title="Equipamiento / Extras" description="Seleccioná todo lo que incluye el vehículo.">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {extras.map((extra) => <CheckOption key={extra} label={extra} />)}
          </div>
        </Section>

        <Section title="Etiquetas del anuncio" description="Elegí las características que mejor describen el vehículo.">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => <CheckOption key={tag} label={tag} />)}
          </div>
        </Section>

        <Section title="Información del vendedor" description="Estos datos se mostrarán para que te contacten directamente.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre">
              <input autoComplete="name" placeholder="Tu nombre" className={field} />
            </Field>
            <Field label="Correo electrónico">
              <input type="email" autoComplete="email" placeholder="nombre@correo.com" className={field} />
            </Field>
            <Field label="Teléfono 1" required>
              <input
                required
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{8}"
                title="Ingresá un número de teléfono de 8 dígitos"
                autoComplete="tel"
                placeholder="8 dígitos"
                className={field}
              />
            </Field>
            <Field label="Teléfono 2">
              <input type="tel" inputMode="numeric" pattern="[0-9]{8}" placeholder="Opcional" className={field} />
            </Field>
            <Field label="Teléfono 3">
              <input type="tel" inputMode="numeric" pattern="[0-9]{8}" placeholder="Opcional" className={field} />
            </Field>
            <Field label="WhatsApp del vendedor">
              <input type="tel" inputMode="numeric" pattern="[0-9]{8}" placeholder="Opcional" className={field} />
            </Field>
          </div>
        </Section>

        <Section
          title="Imágenes"
          description="Agregá de 2 a 4 fotos para un anuncio gratuito. La primera será la foto principal; podés cambiarla antes de publicar."
        >
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={onPhotoDrop}
            className="rounded-xl border-2 border-dashed border-border bg-muted/40 p-5 text-center sm:p-8"
          >
            <label htmlFor="vehicle-photos" className="cursor-pointer">
              <span className="block font-semibold">Arrastrá y soltá tus fotos aquí</span>
              <span className="mt-1 block text-sm text-muted-foreground">o seleccioná imágenes desde tu dispositivo</span>
            </label>
            <input
              ref={fileInput}
              id="vehicle-photos"
              required
              type="file"
              accept="image/*"
              multiple
              aria-describedby="photo-requirements"
              className="mx-auto mt-4 block max-w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:font-semibold file:text-secondary-foreground"
              onChange={onPhotoChange}
            />
            <p id="photo-requirements" aria-live="polite" className="mt-3 text-sm text-muted-foreground">
              {photos.length === 0
                ? "Mínimo 2 y máximo 4 fotos."
                : `${photos.length} de 4 fotos seleccionadas.`}
            </p>
            {photoError && <p role="alert" className="mt-2 text-sm font-semibold text-destructive">{photoError}</p>}
          </div>
          {photoPreviews.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photoPreviews.map(({ file, url }, index) => (
                <div key={`${file.name}-${file.lastModified}-${index}`} className="overflow-hidden rounded-xl border border-border bg-background">
                  <img src={url} alt={`Vista previa ${index + 1}: ${file.name}`} className="aspect-[4/3] w-full object-cover" />
                  <div className="grid gap-2 p-2">
                    <label className="flex items-center gap-2 text-xs font-medium">
                      <input
                        type="radio"
                        name="main-photo"
                        checked={mainPhoto === index}
                        onChange={() => setMainPhoto(index)}
                        className="accent-primary"
                      />
                      Foto principal
                    </label>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="text-left text-xs font-semibold text-destructive hover:underline"
                    >
                      Quitar foto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            Fecha de publicación: se asignará automáticamente cuando el anuncio se publique.
          </p>
        </Section>

        <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          La publicación gratuita admite de 2 a 4 fotos. La publicación y el guardado del formulario estarán disponibles al activar el almacenamiento compartido.
        </div>
        <button
          type="submit"
          disabled
          className="w-full cursor-not-allowed rounded-full bg-muted px-6 py-3 font-bold text-muted-foreground"
        >
          Publicar anuncio (próximamente)
        </button>
      </form>
    </main>
  );
}
