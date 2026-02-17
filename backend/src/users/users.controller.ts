import { Controller, Get, Patch, Param, Body, NotFoundException  } from '@nestjs/common';

import { UsersService } from './users.service';
import { Usuario } from './usuario.entity';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

@Get()
async getAllUsers(): Promise<Omit<Usuario, 'pass'>[]> {
  return this.usersService.findAll();
}

@Patch(':id/status')
async updateStatus(
  @Param('id') id: number,
  @Body('status') status: 'active' | 'inactive',
) {
  return this.usersService.updateStatus(id, status);
}

@Patch(':id/update')
  async updateUser(
    @Param('id') id: string,
    @Body()
    data: {
      nombre?: string;
      usuario?: string;
      email?: string;
      password?: string;
      rol?: string;
      cargo?: string;
      status?: string;
    }
  ) {
    const updatedUser = await this.usersService.updateUser(parseInt(id), data);
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return { message: 'Usuario actualizado', user: updatedUser };
  }


}
