import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TbPacientes } from '../../pacientes/entities/tb_pacientes.entity';

@Entity('tb_documentos')
export class Documento {
  @PrimaryGeneratedColumn()
  id_documento: number;

  @Column()
  id_paciente: number;

  @Column({ name: 'documento_tipo', type: 'varchar', length: 1000 })
  tipo: string;

  @Column({ name: 'fecha_registro', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @Column({ type: 'boolean', default: false })
  es_pendiente: boolean;

  /* FK hacia Paciente */
  @ManyToOne(() => TbPacientes, (pac) => pac.documentos)
  @JoinColumn({ name: 'id_paciente' })
  paciente!: TbPacientes

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column()
  id_usuario: number;
}
