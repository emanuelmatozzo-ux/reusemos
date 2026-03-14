 "use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function MainHeader() {
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
    <header className="border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link
          href="/inicio"
          className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          ReUsemos
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/inicio"
            className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Inicio
          </Link>
          <Link
            href="/objetos"
            className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Objetos
          </Link>
          <Link
            href="/publicar"
            className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Publicar
          </Link>
          <Link
            href="/mi-cuenta"
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {userName ? userName : userEmail ? "Mi cuenta" : "Mi cuenta"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

