import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TbPacientes } from '../../pacientes/entities/tb_pacientes.entity'; // Ajusta esta ruta si es necesario

@Entity('tb_medicamentos')
export class Medicamento {
  @PrimaryGeneratedColumn()
  id_medicamento: number;

  @Column({ type: 'varchar', length: 255 })
  nombre_generico: string;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_modificacion', nullable: true })
  fecha_modificacion?: Date;

  @Column({ type: 'integer', nullable: true })
  id_paciente: number;

  @ManyToOne(() => TbPacientes, (paciente) => paciente.medicamentos, { nullable: true })
  @JoinColumn({ name: 'id_paciente' })
  paciente: TbPacientes;
}
