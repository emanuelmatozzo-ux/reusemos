export default function ReservaErrorPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-10">
      <div className="w-full rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center text-sm text-red-800 shadow-sm dark:border-red-900/70 dark:bg-red-950/60 dark:text-red-100">
        <h1 className="text-lg font-semibold tracking-tight">
          Hubo un problema con tu pago
        </h1>
        <p className="mt-2 text-xs">
          El pago no se completó correctamente o fue rechazado. Podés intentar
          de nuevo desde la página del objeto.
        </p>
      </div>
    </div>
  );
}

