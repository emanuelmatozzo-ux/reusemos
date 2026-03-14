"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processSession = async () => {
      // Al importar el cliente, Supabase procesa el hash del magic link
      // y guarda la sesión en localStorage si es válido.
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/mi-cuenta");
        return;
      }

      // Verificamos si el usuario ya tiene perfil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      setProcessing(false);

      if (profileError) {
        // Si hay error leyendo el perfil, lo mandamos igual a completar-perfil
        router.replace("/mi-cuenta/completar-perfil");
        return;
      }

      if (!profile) {
        router.replace("/mi-cuenta/completar-perfil");
      } else {
        router.replace("/inicio");
      }
    };

    processSession();
  }, [router]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6 py-10">
      <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200">
        <p>
          {processing
            ? "Procesando tu inicio de sesión..."
            : "Redirigiendo a tu cuenta..."}
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Si no pasa nada en unos segundos, volvé a intentar desde /mi-cuenta.
        </p>
      </div>
    </div>
  );
}

