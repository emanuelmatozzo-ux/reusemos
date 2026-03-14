"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const MAX_PHOTOS = 5;
const BUCKET_NAME = "rental-photos";

export default function PublicarPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [area, setArea] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/mi-cuenta");
        return;
      }
      setUserId(data.user.id);
      setLoadingUser(false);
    };

    checkUser();
  }, [router]);

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const limited = selected.slice(0, MAX_PHOTOS);
    setFiles(limited);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) {
      router.replace("/mi-cuenta");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const photoUrls: string[] = [];

      for (const file of files) {
        const filePath = `${userId}/${Date.now()}-${file.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "image/*",
          });

        if (uploadError) {
          throw new Error(
            `No pudimos subir la foto "${file.name}": ${uploadError.message}`
          );
        }

        const path = uploadData?.path ?? filePath;

        const { data: publicUrlData, error: publicUrlError } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(path);

        if (publicUrlError) {
          throw new Error(
            `La foto se subió pero no pudimos obtener la URL pública. Verificá que el bucket "${BUCKET_NAME}" sea público.`
          );
        }

        if (publicUrlData?.publicUrl) {
          photoUrls.push(publicUrlData.publicUrl);
        }
      }

      const { error: insertError } = await supabase.from("rental_items").insert({
        title,
        description,
        price_per_day: Number(pricePerDay),
        category,
        area,
        photos: photoUrls,
        availability: null,
        owner_id: userId,
      });

      if (insertError) {
        throw insertError;
      }

      setSuccess("Tu objeto se publicó correctamente en ReUsemos.");
      setTitle("");
      setDescription("");
      setCategory("");
      setPricePerDay("");
      setArea("");
      setFiles([]);

      router.push("/objetos");
    } catch (err: any) {
      setError(
        err?.message ??
          "Ocurrió un error al publicar el objeto. Intentá de nuevo más tarde."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-10">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Cargando tu sesión...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Publicar un objeto
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Cargá la información básica del objeto que querés ofrecer en ReUsemos.
        </p>
      </header>
      <main className="flex-1 rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Título del objeto
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="Ej: Taladro percutor Bosch"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Descripción
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
              rows={4}
              placeholder="Contanos el estado, usos recomendados, qué incluye, etc."
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Categoría
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="">Seleccioná una categoría</option>
                <option value="Herramientas">Herramientas</option>
                <option value="Electrónica">Electrónica</option>
                <option value="Deportes">Deportes</option>
                <option value="Hogar">Hogar</option>
                <option value="Vehículos">Vehículos</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Precio por día (ARS)
              </label>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Zona o barrio
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                placeholder="Ej: Palermo, CABA"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Fotos (hasta {MAX_PHOTOS})
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              className="mt-1 block w-full text-xs text-zinc-600 dark:text-zinc-300"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Subí fotos claras del objeto. Vamos a guardarlas en el storage de
              Supabase.
            </p>
            {files.length > 0 && (
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                {files.length} archivo(s) seleccionado(s).
              </p>
            )}
          </div>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {success}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "Publicando..." : "Publicar objeto"}
          </button>
        </form>
      </main>
    </div>
  );
}

