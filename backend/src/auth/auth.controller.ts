import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { usuario: string; password: string }) {
    const user = await this.authService.validateUser(body.usuario, body.password);
    return this.authService.login(user);
  }

  @Get('login')
  async loginget(@Body() body: { usuario: string; password: string }) {
    return {
      message: 've al post (editado 6)'
    }
  }

  @Post('register')
  async register(@Body() body: { usuario: string; password: string; email: string; nombre: string; rol: string, cargo: string}) {
    return this.authService.register(body.usuario, body.password, body.email, body.nombre, body.rol,  body.cargo)
  }
}
