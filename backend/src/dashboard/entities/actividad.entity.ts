// src/dashboard/entities/actividad.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tb_actividades')
export class Actividad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipo: string;

  @Column()
  descripcion: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;
}

