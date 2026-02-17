// src/tipo-documento/entities/tb_tipo_documento.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_tipo_documento')
export class TbTipoDocumento {
  @PrimaryGeneratedColumn()
  id_tipo_documento: number;

  @Column({ name: 'descripcion' })
  descripcion: string;
}
