// pacientes.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { PacientesService } from './pacientes.service';

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  async create(@Body() createPacienteDto: CreatePacienteDto) {
    return this.pacientesService.create(createPacienteDto);
  }
}
