export default function ReservaPendientePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-10">
      <div className="w-full rounded-2xl border border-zinc-200 bg-white/80 p-6 text-center text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Tu pago está pendiente
        </h1>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Mercado Pago está procesando tu pago. Cuando se confirme, tu reserva
          va a aparecer en tu cuenta.
        </p>
      </div>
    </div>
  );
}

