"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Reserva = {
  id: string;
  fecha_inicio: string;
  fecha_fin: string;
  total: number;
  estado: string;
  objeto_id: string;
  rental_items: {
    title: string;
    area: string;
  } | null;
};

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("reservas")
        .select("id, fecha_inicio, fecha_fin, total, estado, objeto_id, rental_items(title, area)")
        .eq("inquilino_id", userData.user.id)
        .order("fecha_inicio", { ascending: false });

      setReservas((data as unknown as Reserva[]) ?? []);
      setLoading(false);
    };
    cargar();
  }, []);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mis reservas</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Tus reservas activas y pasadas.
        </p>
      </header>
      {loading ? (
        <p className="text-sm text-zinc-500">Cargando...</p>
      ) : reservas.length === 0 ? (
        <p className="text-sm text-zinc-500">No tenés reservas todavía.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reservas.map((r) => (
            <div key={r.id} className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {r.rental_items?.title ?? "Objeto"}
                  </p>
                  <p className="text-xs text-zinc-500">{r.rental_items?.area}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  r.estado === "confirmada" ? "bg-emerald-100 text-emerald-700" :
                  r.estado === "pendiente" ? "bg-amber-100 text-amber-700" :
                  r.estado === "cancelada" ? "bg-red-100 text-red-700" :
                  "bg-zinc-100 text-zinc-600"
                }`}>
                  {r.estado}
                </span>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-zinc-500">
                <span>Desde: {r.fecha_inicio}</span>
                <span>Hasta: {r.fecha_fin}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                ${r.total.toLocaleString("es-AR")}
              </p>
              <Link href={`/objetos/${r.objeto_id}`} className="mt-3 inline-block text-xs text-zinc-500 underline">
                Ver objeto
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}