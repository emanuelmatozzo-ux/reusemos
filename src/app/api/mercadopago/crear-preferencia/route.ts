import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!accessToken) {
  console.warn("Mercado Pago: falta MERCADOPAGO_ACCESS_TOKEN en las variables de entorno");
}

if (!appUrl) {
  console.warn("Mercado Pago: falta NEXT_PUBLIC_APP_URL en las variables de entorno");
}

const mpClient = accessToken && new MercadoPagoConfig({ accessToken });

export async function POST(request: Request) {
  try {
    if (!mpClient) {
      return NextResponse.json({ error: "Mercado Pago no está configurado en el servidor." }, { status: 500 });
    }
    if (!appUrl) {
      return NextResponse.json({ error: "Falta configurar NEXT_PUBLIC_APP_URL." }, { status: 500 });
    }

    const { objetoId, fechaInicio, fechaFin, total } = await request.json();

    if (!objetoId || !fechaInicio || !fechaFin || !total) {
      return NextResponse.json({ error: "Faltan datos para crear la preferencia de pago." }, { status: 400 });
    }

    const numericTotal = Number(total);
    if (!Number.isFinite(numericTotal) || numericTotal <= 0) {
      return NextResponse.json({ error: "El total a pagar no es válido." }, { status: 400 });
    }

    const successUrl = `${appUrl}/reservas/exito?objeto_id=${encodeURIComponent(objetoId)}&fecha_inicio=${encodeURIComponent(fechaInicio)}&fecha_fin=${encodeURIComponent(fechaFin)}&total=${encodeURIComponent(numericTotal)}`;
    const pendingUrl = `${appUrl}/reservas/pendiente`;
    const failureUrl = `${appUrl}/reservas/error`;

    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: [
          {
            id: "reserva-reusemos",
            title: "Reserva ReUsemos",
            quantity: 1,
            unit_price: numericTotal,
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: successUrl,
          pending: pendingUrl,
          failure: failureUrl,
        },
        metadata: {
          objeto_id: objetoId,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          total: numericTotal,
        },
      },
    });

    const initPoint = (result as any).init_point || (result as any).sandbox_init_point;

    if (!initPoint) {
      return NextResponse.json({ error: "No se pudo obtener la URL de checkout de Mercado Pago." }, { status: 500 });
    }

    return NextResponse.json({ init_point: initPoint, preference_id: (result as any).id }, { status: 200 });

  } catch (error) {
    console.error("[MercadoPago] Error al crear preferencia de pago:", error);
    return NextResponse.json({ error: "No se pudo crear la preferencia de pago." }, { status: 500 });
  }
}