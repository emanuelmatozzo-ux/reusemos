import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ReservaForm } from "@/components/ReservaForm";

interface ObjetoDetallePageProps {
  params: {
    id: string;
  };
}

export default async function ObjetoDetallePage({
  params,
}: ObjetoDetallePageProps) {
  const { id } = await params;

  console.log("[ObjetoDetallePage] id desde params:", id);

  const { data, error } = await supabase
    .from("rental_items")
    .select("id, title, description, category, area, price_per_day, photos")
    .eq("id", id)
    .maybeSingle();

  console.log("[ObjetoDetallePage] resultado Supabase:", {
    data,
    error,
  });

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200">
          <p className="font-medium">
            No encontramos este objeto o hubo un problema al cargarlo.
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Volvé a la lista de objetos e intentá de nuevo.
          </p>
        </div>
      </div>
    );
  }

  const imageUrl =
    data.photos && data.photos.length > 0
      ? data.photos[0]
      : "/placeholder-object.png";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-3">
        <div className="mb-1">
          <Link
            href="/objetos"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <span aria-hidden="true">←</span>
            <span>Volver a objetos</span>
          </Link>
        </div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {data.category || "Objeto"}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {data.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {data.area || "Zona no especificada"}
        </p>
      </header>
      <main className="flex flex-col gap-6">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="relative h-64 w-full">
            <Image
              src={imageUrl}
              alt={data.title}
              fill
              className="object-cover"
            />
          </div>
        </div>
        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-5 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Descripción
          </p>
          <p className="mt-2 whitespace-pre-line">
            {data.description || "Sin descripción."}
          </p>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Precio por día
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              ${data.price_per_day.toLocaleString("es-AR")}{" "}
              <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                / día
              </span>
            </p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Seleccioná fechas para ver el total estimado de tu reserva.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Categoría y zona
              </p>
              <p className="mt-1">
                {data.category || "Sin categoría"} ·{" "}
                {data.area || "Zona no especificada"}
              </p>
            </div>
            <ReservaForm objetoId={data.id} pricePerDay={data.price_per_day} />
          </div>
        </section>
      </main>
    </div>
  );
}

