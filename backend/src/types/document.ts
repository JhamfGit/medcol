// src/types/document.ts
export interface DocumentDto {
  id: string;
  msd: string;
  patientId: string;
  patientName: string;
  type: string;
  date: string;          // ISO 8601
  status: 'Completo' | 'Pendiente';
  fileUrl: string;
}
