import { Controller, Get, Query } from '@nestjs/common';
import { PendientesService } from './pendientes.service';
import { Documento } from './entities/docs_pendientes.entity';
import { TbPacientes } from '../pacientes/entities/tb_pacientes.entity';

@Controller('pendientes')
export class PendientesController {
  constructor(private readonly pendientesService: PendientesService) {}

  @Get('buscar')
  async buscarDocumentos(
    @Query('msd') msd?: string,
    @Query('no_documento') id?: string,
  ): Promise<{ paciente: TbPacientes | null; documentos: Documento[] }> {
    return this.pendientesService.buscarPorMSD_O_ID(msd, id);
  }
}


