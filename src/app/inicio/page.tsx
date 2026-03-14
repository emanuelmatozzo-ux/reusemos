"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function InicioPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const loadUserAndProfile = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setUserEmail(null);
        setUserName(null);
        return;
      }

      setUserEmail(data.user.email ?? null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("nombre")
        .eq("id", data.user.id)
        .maybeSingle();

      setUserName(profile?.nombre ?? null);
    };

    loadUserAndProfile();
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10">
      <section className="max-w-xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Alquilá lo que no usás. Conseguí lo que necesitás.
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          ReUsemos conecta personas en Argentina para alquilar herramientas,
          equipos, bicicletas y más. Sin comprar, sin desperdiciar.
        </p>
      </section>
      <section className="rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
        <p className="font-medium text-zinc-800 dark:text-zinc-100">
          Estado del proyecto
        </p>
        <p className="mt-2">
          Esta es la base de tu plataforma. Desde acá podés navegar a objetos,
          publicar nuevos ítems, ver tus reservas y gestionar tu cuenta.
        </p>
      </section>
    </main>
  );
}

