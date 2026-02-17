// src/entregas/entregas.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { EntregasService } from './entregas.service';

@Controller('entregas')
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  @Get()
  async findAll(@Query('estado') estado?: string) {
    // Si te llega ?estado=D o ?estado=P, lo pasamos al servicio
    return this.entregasService.findAll(estado);
  }
  @Post('guardar-medicamentos')
  async guardarMedicamentosDesdeAPI(
    @Body() body: { msd: string; id_usuario: number },
  ) {
    await this.entregasService.guardarDesdeAPI(body.msd, body.id_usuario);
    return { message: 'Medicamentos guardados correctamente' };
  }
}
