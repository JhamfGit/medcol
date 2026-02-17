// src/lib/document.ts
import axios from 'axios';
import { DocumentDto } from '@/types/document';

// Ajusta la URL base según tu backend
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

// GET /documentos?cedula=... o ?msd=...
export async function getDocuments(params: { cedula?: string; msd?: string }) {
  const { data } = await api.get<DocumentDto[]>('/documentos', { params });
  return data;
}
