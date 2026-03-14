import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

type RentalItemCard = {
  id: string;
  title: string;
  category: string | null;
  area: string | null;
  price_per_day: number;
  photos: string[] | null;
};

export default async function ObjetosPage() {
  const { data, error } = await supabase
    .from("rental_items")
    .select("id, title, category, area, price_per_day, photos")
    .order("created_at", { ascending: false });

  console.log("[ObjetosPage] items cargados:", data, "error:", error);

  const items: RentalItemCard[] = data ?? [];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Objetos</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Explorá herramientas, equipos, bicis y más para alquilar.
          </p>
        </div>
        <Link
          href="/publicar"
          className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Publicar un objeto
        </Link>
      </header>
      <main className="flex-1">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            No pudimos cargar los objetos. Intentá de nuevo en unos minutos.
          </div>
        )}

        {!error && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
            <p className="font-medium text-zinc-800 dark:text-zinc-100">
              Todavía no hay objetos publicados.
            </p>
            <p className="mt-1">
              Sé la primera persona en compartir algo que no usás haciendo clic
              en &quot;Publicar un objeto&quot;.
            </p>
          </div>
        )}

        {!error && items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const imageUrl =
                item.photos && item.photos.length > 0
                  ? item.photos[0]
                  : "/placeholder-object.png";

              return (
                <Link
                  key={item.id}
                  href={`/objetos/${item.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                >
                  <div className="relative h-40 w-full bg-zinc-100 dark:bg-zinc-900">
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 px-4 py-3">
                    <p className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {item.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {item.category || "Sin categoría"} · {item.area || "Zona"}
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      ${item.price_per_day.toLocaleString("es-AR")}{" "}
                      <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                        / día
                      </span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

