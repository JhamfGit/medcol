//documento.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tb_documentos')
export class Documento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean' })
  es_pendiente: boolean;

  @Column({ type: 'timestamp' })
  fecha_registro: Date;
}
