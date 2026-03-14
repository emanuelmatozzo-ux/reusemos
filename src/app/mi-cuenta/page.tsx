"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MiCuentaPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? null);
      }
    });
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setMessage(null);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    });

    setSending(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "Te enviamos un enlace de acceso a tu email. Revisá tu casilla y seguí las instrucciones."
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mi cuenta</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Accedé usando tu email. Te enviamos un enlace mágico (OTP) para
          iniciar sesión.
        </p>
      </header>
      <main className="flex-1 rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
        {userEmail ? (
          <div className="space-y-4">
            <p className="text-sm">
              Sesión iniciada como{" "}
              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                {userEmail}
              </span>
              .
            </p>
            <button
              onClick={handleLogout}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                placeholder="tu@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {sending ? "Enviando enlace..." : "Enviar enlace de acceso"}
            </button>
            {message && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                {message}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
          </form>
        )}
      </main>
    </div>
  );
}

