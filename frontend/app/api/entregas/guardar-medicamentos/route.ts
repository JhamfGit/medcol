// frontend/app/api/entregas/guardar-medicamentos/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const BACKEND = process.env.NEXT_PUBLIC_API_URL;
    if (!BACKEND) {
      return NextResponse.json(
        { message: "Falta configurar NEXT_PUBLIC_BACKEND_URL" },
        { status: 500 }
      );
    }

    const resp = await fetch(`${BACKEND}/entregas/guardar-medicamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // reenvía la autorización si tienes JWT en cookies o headers
        ...(req.headers.get("authorization") && {
          Authorization: req.headers.get("authorization")!,
        }),
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (err: any) {
    console.error("Error proxy /api/entregas/guardar-medicamentos:", err);
    return NextResponse.json(
      { message: "Error interno en proxy" },
      { status: 500 }
    );
  }
}
