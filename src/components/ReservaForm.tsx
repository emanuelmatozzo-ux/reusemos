 "use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ReservaFormProps {
  objetoId: string;
  pricePerDay: number;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateForDb(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  d.setDate(1);
  return d;
}

function getMonthDays(currentMonth: Date) {
  const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const days: (Date | null)[] = [];

  const firstWeekday = start.getDay(); // 0 domingo, 1 lunes, ...
  const leadingEmpty = firstWeekday === 0 ? 6 : firstWeekday - 1; // hacer que la semana empiece en lunes

  for (let i = 0; i < leadingEmpty; i++) {
    days.push(null);
  }

  for (let d = 1; d <= end.getDate(); d++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function ReservaForm({ objetoId, pricePerDay }: ReservaFormProps) {
  const today = startOfDay(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = startOfDay(startDate);
    const end = startOfDay(endDate);
    if (end < start) return 0;
    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return Math.floor(diffDays) || 1;
  }, [startDate, endDate]);

  const total = days * pricePerDay;

  const handleDayClick = (day: Date) => {
    const date = startOfDay(day);
    if (date < today) return;

    setSuccess(null);

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      setError(null);
      return;
    }

    if (startDate && !endDate) {
      if (date < startDate) {
        setError("La fecha de fin no puede ser anterior a la de inicio.");
        return;
      }
      setEndDate(date);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!startDate || !endDate) {
      setError("Elegí una fecha de inicio y una fecha de fin.");
      return;
    }

    if (days <= 0) {
      setError("La fecha de fin tiene que ser igual o posterior a la de inicio.");
      return;
    }

    const startStr = formatDateForDb(startOfDay(startDate));
    const endStr = formatDateForDb(startOfDay(endDate));

    setLoading(true);
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) {
        throw userError;
      }
      if (!userData.user) {
        setError("Tenés que iniciar sesión para hacer una reserva.");
        return;
      }

      const response = await fetch("/api/mercadopago/crear-preferencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objetoId,
          fechaInicio: startStr,
          fechaFin: endStr,
          total,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        console.error("[ReservaForm] error al crear preferencia MP:", payload);
        setError(
          payload?.error ||
            "No pudimos iniciar el pago con Mercado Pago. Probá de nuevo."
        );
        return;
      }

      const payload = await response.json();
      if (!payload.init_point) {
        setError(
          "No pudimos obtener la URL de pago de Mercado Pago. Probá de nuevo."
        );
        return;
      }

      window.location.href = payload.init_point as string;
    } catch (err) {
      console.error("[ReservaForm] error inesperado:", err);
      setError("Ocurrió un error inesperado. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const monthDays = getMonthDays(currentMonth);
  const monthLabel = currentMonth.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const isInRange = (day: Date) => {
    if (!startDate || !endDate) return false;
    const d = startOfDay(day);
    return d >= startOfDay(startDate) && d <= startOfDay(endDate);
  };

  const isSelected = (day: Date) => {
    const d = startOfDay(day).getTime();
    return (
      (startDate && startOfDay(startDate).getTime() === d) ||
      (endDate && startOfDay(endDate).getTime() === d)
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Reserva
      </p>

      <div className="mt-3 rounded-xl border border-zinc-200 bg-white/70 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            ‹
          </button>
          <span className="text-xs font-medium capitalize text-zinc-800 dark:text-zinc-100">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            ›
          </button>
        </div>
        <div className="mb-1 grid grid-cols-7 gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
          <span>Lu</span>
          <span>Ma</span>
          <span>Mi</span>
          <span>Ju</span>
          <span>Vi</span>
          <span>Sa</span>
          <span>Do</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day, idx) => {
            if (!day) {
              return <div key={idx} className="h-7" />;
            }

            const isPast = startOfDay(day) < today;
            const selected = isSelected(day);
            const inRange = isInRange(day);

            let bg = "";
            let text = "text-zinc-700 dark:text-zinc-200";
            if (inRange) {
              bg = "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900";
              text = "";
            } else if (isPast) {
              text = "text-zinc-300 dark:text-zinc-700";
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isPast}
                onClick={() => handleDayClick(day)}
                className={`h-7 rounded-full text-[11px] ${bg} ${text} hover:bg-zinc-900 hover:text-zinc-50 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit ${
                  selected ? "ring-1 ring-zinc-900/60 dark:ring-zinc-100/70" : ""
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span>
            Inicio:{" "}
            {startDate
              ? formatDateForDb(startOfDay(startDate))
              : "–"}
          </span>
          <span>
            Fin:{" "}
            {endDate
              ? formatDateForDb(startOfDay(endDate))
              : "–"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          ${pricePerDay.toLocaleString("es-AR")} / día
        </p>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Total estimado
          </p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {days > 0 ? `$${total.toLocaleString("es-AR")}` : "-"}
          </p>
          {days > 0 && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {days} {days === 1 ? "día" : "días"}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-50 shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "Reservando..." : "Reservar"}
      </button>
    </form>
  );
}

