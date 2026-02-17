//entrga.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tb_entregas')
export class Medicamento {
  @PrimaryGeneratedColumn()
  id_medicamentos: number;

  @Column()
  estado: string;
}
