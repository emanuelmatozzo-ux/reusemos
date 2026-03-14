"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type EstadoGuardado = "pendiente" | "ok" | "error";

export default function ReservaExitoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [estadoGuardado, setEstadoGuardado] =
    useState<EstadoGuardado>("pendiente");
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    const confirmarReserva = async () => {
      const objetoId = searchParams.get("objeto_id");
      const fechaInicio = searchParams.get("fecha_inicio");
      const fechaFin = searchParams.get("fecha_fin");
      const totalStr = searchParams.get("total");

      if (!objetoId || !fechaInicio || !fechaFin || !totalStr) {
        setEstadoGuardado("error");
        setMensaje(
          "No pudimos recuperar los datos de tu reserva desde Mercado Pago."
        );
        return;
      }

      const total = Number(totalStr);
      if (!Number.isFinite(total) || total <= 0) {
        setEstadoGuardado("error");
        setMensaje("El monto de la reserva no es válido.");
        return;
      }

      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) {
          throw userError;
        }
        if (!userData.user) {
          setEstadoGuardado("error");
          setMensaje(
            "Necesitás iniciar sesión para asociar la reserva a tu cuenta."
          );
          return;
        }

        const inquilinoId = userData.user.id;

        // Intentamos insertar la reserva como confirmada.
        const { error: insertError } = await supabase.from("reservas").insert({
          objeto_id: objetoId,
          inquilino_id: inquilinoId,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          total,
          estado: "confirmada",
        });

        if (insertError) {
          console.error(
            "[ReservaExitoPage] error al guardar reserva:",
            insertError
          );
          setEstadoGuardado("error");
          setMensaje(
            "El pago se realizó, pero no pudimos registrar la reserva. Contactanos para revisarlo."
          );
          return;
        }

        setEstadoGuardado("ok");
        setMensaje("Tu reserva fue confirmada correctamente.");
      } catch (error) {
        console.error(
          "[ReservaExitoPage] error inesperado al confirmar reserva:",
          error
        );
        setEstadoGuardado("error");
        setMensaje(
          "Ocurrió un error al confirmar la reserva. Si el pago se realizó, contactanos."
        );
      }
    };

    confirmarReserva();
  }, [searchParams]);

  const titulo =
    estadoGuardado === "ok"
      ? "¡Pago exitoso!"
      : estadoGuardado === "pendiente"
        ? "Confirmando tu reserva..."
        : "Hubo un problema con tu reserva";

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-10">
      <div className="w-full rounded-2xl border border-zinc-200 bg-white/80 p-6 text-center text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {titulo}
        </h1>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {mensaje ||
            "Estamos guardando tu reserva en el sistema. Esto puede tardar unos segundos."}
        </p>
        <div className="mt-4 flex justify-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => router.push("/mi-cuenta")}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-1.5 font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Ver mis reservas
          </button>
          <button
            type="button"
            onClick={() => router.push("/objetos")}
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-1.5 font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Volver a objetos
          </button>
        </div>
      </div>
    </div>
  );
}

