// src/pacientes/entities/tb_pacientes.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Documento } from '../../documentos/entities/documento.entity';
import { Medicamento } from '../../medicamentos/entities/medicamento.entity';
import { Entrega } from '../../entregas/entities/entrega.entity';

@Entity('tb_pacientes')
export class TbPacientes {
  @PrimaryGeneratedColumn()
  id_paciente: number;

  @OneToMany(() => Entrega, (e) => e.paciente)
  entregas: Entrega[];

  @Column({ type: 'varchar', length: 20 })
  msd: string;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 20 })
  no_documento: string;

  @Column()
  id_tipo_documento: number;

  @Column({ length: 100, nullable: true })
  ciudad?: string;

  @Column({ length: 50, nullable: true })
  regimen?: string;

  @Column({ length: 255, nullable: true })
  medico?: string;

  @Column({ length: 255, nullable: true })
  drogueria?: string;

  @Column()
  id_usuario: number;

  // Documentos del paciente
  @OneToMany(() => Documento, (doc) => doc.id_paciente)
  documentos!: Documento[];

  // Medicamentos entregados al paciente
  @OneToMany(() => Medicamento, (med) => med.paciente)
  medicamentos: Medicamento[];
}
