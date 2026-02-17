// src/entregas/entities/entrega.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TbPacientes } from '../../pacientes/entities/tb_pacientes.entity';

@Entity('tb_entregas')
export class Entrega {
  @PrimaryGeneratedColumn() id_entrega: number;
  @Column() id_paciente: number;
  @ManyToOne(() => TbPacientes, (p) => p.entregas)
  @JoinColumn({ name: 'id_paciente' })
  paciente: TbPacientes; // <— relación

  @Column() id_usuario: number;
  @Column({ length: 20, nullable: true }) estado: string;
  @Column({ type: 'varchar', length: 50, nullable: true })
  codigo?: string;
  @Column({ name: 'nombre_generico' })
  nombre_generico: string;
  @Column({ nullable: true }) concentracion?: string;
  @Column({ type: 'integer', nullable: true })
  cantidad_ordenada?: number;
  @Column({ type: 'timestamp', nullable: true })
  fecha_suministro?: Date;
  @Column() id_medicamento: number;
}
