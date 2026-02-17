// lib/documentos.ts
import { apiFetch } from "./api";

export const buscarDocumentos = async ({
  msd,
  id,
}: {
  msd?: string;
  id?: string | number;
}) => {
  const query = new URLSearchParams();
  if (msd) query.append("msd", msd);
  if (id) query.append("no_documento", id.toString());

  return apiFetch(`/gest_documental/buscar?${query.toString()}`);
};
