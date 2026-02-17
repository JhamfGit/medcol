// src/entregas/entities/tb_medicamentos.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tb_medicamentos')
export class TbMedicamentos {
  @PrimaryGeneratedColumn({ name: 'id_medicamento' })
  id_medicamento: number;

  @Column({
    name: 'nombre_generico',
    type: 'varchar',
    length: 255,
  })
  nombre_generico: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp' })
  fecha_creacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamp' })
  fecha_modificacion: Date;
}
