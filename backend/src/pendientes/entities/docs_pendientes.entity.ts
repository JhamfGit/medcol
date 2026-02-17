import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TbPacientes } from '../../pacientes/entities/tb_pacientes.entity';

@Entity('tb_documentos')
export class Documento {
  @PrimaryGeneratedColumn({ name: 'id_documento' })
  id: number;

  @Column({ name: 'documento_tipo' })
  type: string;

  @Column({ name: 'fecha_creacion', type: 'timestamp' })
  date: Date;

  @Column({ name: 'es_pendiente' })
  status: boolean;

  @Column({ name: 'url' })
  fileUrl: string;

  @Column({ name: 'id_paciente' })
  patientId: number;

  // 🔁 Este nombre debe coincidir con el que se usa en TbPacientes
  @ManyToOne(() => TbPacientes, (paciente) => paciente.documentos)
  @JoinColumn({ name: 'id_paciente' })
  id_paciente: TbPacientes; // ← dejamos este nombre así
}