import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tb_entregas')
export class Entrega {
  @PrimaryGeneratedColumn()
  id_entrega: number;

  @Column()
  id_paciente: number;

  @Column({ length: 1 })
  estado: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_modificacion?: Date;

  @Column()
  id_usuario: number;

  @Column({ type: 'integer', name: 'cantidad_ordenada', nullable: true })
  cantidad_ordenada?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigo?: string;

  @Column({ name: 'nombre_generico', type: 'varchar', length: 255 })
  nombre_generico: string;

  @Column({ type: 'varchar', nullable: true })
  concentracion?: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_suministro?: Date | null;

  @Column()
  id_medicamento: number;
}
