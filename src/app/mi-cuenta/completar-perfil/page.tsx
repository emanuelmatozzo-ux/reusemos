"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CompletarPerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/mi-cuenta");
        return;
      }

      setUserId(data.user.id);

      // Intentar precargar perfil si ya existe (por si viene a editar)
      const { data: profile } = await supabase
        .from("profiles")
        .select("nombre, avatar")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile) {
        setNombre(profile.nombre ?? "");
        setAvatar(profile.avatar ?? "");
      }

      setLoading(false);
    };

    loadUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        nombre: nombre || null,
        avatar: avatar || null,
      },
      { onConflict: "id" }
    );

    setSaving(false);

    if (error) {
      setError(
        error.message ||
          "No pudimos guardar tu perfil. Intentá de nuevo en unos minutos."
      );
      return;
    }

    router.replace("/inicio");
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6 py-10">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Cargando tu cuenta...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Completá tu perfil
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Antes de continuar, contanos tu nombre. Esto va a aparecer en el
          header y en tus publicaciones.
        </p>
      </header>
      <main className="flex-1 rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Nombre
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="Ej: Ana Pérez"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Avatar (URL opcional)
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="https://..."
            />
          </div>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? "Guardando..." : "Guardar y continuar"}
          </button>
        </form>
      </main>
    </div>
  );
}

