import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,
  ) {}

  async findByUsername(usuario: string): Promise<Usuario | null> {
    return this.userRepository.findOne({ where: { usuario } });
  }

  async createUser(usuario: string, hashedPassword: string, email: string, nombre: string, rol: string, cargo: string, status: string = 'active',): Promise<Usuario> {
    const newUser = this.userRepository.create({ 
      usuario, 
      pass: hashedPassword, 
      email, 
      nombre, 
      rol,
      cargo,
      status, 
    });
    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<Omit<Usuario, 'pass'>[]> {
  const users = await this.userRepository.find();
  return users.map(({ pass, ...rest }) => rest);
  } 

  async updateStatus(id: number, status: 'active' | 'inactive') {
  const user = await this.userRepository.findOne({ where: { id_usuario: id } });
  if (!user) throw new NotFoundException('Usuario no encontrado');
  user.status = status;
  return this.userRepository.save(user);
}

async updateUser(id: number, updates: Partial<Usuario>): Promise<Usuario | null> {
    const user = await this.userRepository.findOne({ where: { id_usuario: id } });
    if (!user) return null;

    // Solo actualiza los campos si están presentes
    if (updates.nombre) user.nombre = updates.nombre;
    if (updates.usuario) user.usuario = updates.usuario;
    if (updates.email) user.email = updates.email;
    if (updates.rol) user.rol = updates.rol;
    if (updates.cargo) user.cargo = updates.cargo;
    if (updates.status) user.status = updates.status;

    if (updates.pass && updates.pass.trim() !== '') {
      const salt = await bcrypt.genSalt();
      user.pass = await bcrypt.hash(updates.pass, salt);
    }

    return this.userRepository.save(user);
  }

}
