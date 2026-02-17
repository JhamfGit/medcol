import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(usuario: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(usuario);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.status?.toLowerCase() !== 'active') {
      throw new UnauthorizedException(
        'Tu usuario está inactivo. Contacta al administrador.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.pass);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const { pass, ...result } = user;
    return result;
  }

  async login(user: any) {
    // Incluir los nuevos campos en el payload del JWT
    const payload = {
      sub: user.id_usuario,
      username: user.usuario,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      cargo: user.cargo,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(
    usuario: string,
    password: string,
    email: string,
    nombre: string,
    rol: string,
    cargo: string,
  ) {
    const existingUser = await this.usersService.findByUsername(usuario);
    if (existingUser) {
      throw new BadRequestException('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Asegúrate de pasar los nuevos campos al crear el usuario
    const newUser = await this.usersService.createUser(
      usuario,
      hashedPassword,
      email,
      nombre,
      rol,
      cargo,
    );

    return this.login(newUser); // Devuelve token al registrarse
  }
}
