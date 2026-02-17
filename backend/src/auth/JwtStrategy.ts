import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secreto_super_seguro',
    });
  }

  /*async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }*/

  async validate(payload: any) {
    console.log('🔑 Validando token, payload:', payload);
    return {
      id: payload.sub, // ✅ ahora estará disponible como req.user.id
      username: payload.username,
      email: payload.email,
      nombre: payload.nombre,
      rol: payload.rol,
      cargo: payload.cargo,
    };
  }
}
