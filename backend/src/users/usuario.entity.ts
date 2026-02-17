import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('tb_usuarios')
@Unique(['usuario'])  // Asegura que el campo 'usuario' sea único
@Unique(['email'])    // Asegura que el campo 'email' sea único
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  usuario: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  pass: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })  // Campo 'email' único
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  rol: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  cargo: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string; // 'active' o 'inactive'

}
