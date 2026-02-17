// lib/patient.ts

export async function getPatientsFromApi(params: {
  id_documento?: string;
  factura?: string;
}) {
  const query = new URLSearchParams();

  if (params.id_documento) {
    query.append("id_documento", params.id_documento);
  }

  if (params.factura) {
    query.append("factura", params.factura);
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/integracion-rfast/datos?${query.toString()}`,
  );

  if (!res.ok) {
    throw new Error("Error al traer los pacientes");
  }

  const data = await res.json();
  return data;
}
