import { Controller, Get, Query } from '@nestjs/common';
import { GestDocumentalService } from './gest_documental.service';
import { Documento } from './entities/documento.entity';
import { TbPacientes } from '../pacientes/entities/tb_pacientes.entity';
@Controller('gest_documental')
export class GestDocumentalController {
  constructor(private readonly gestDocumentalService: GestDocumentalService) {}

  @Get('buscar')
  async buscarDocumentos(
    @Query('msd') msd?: string,
    @Query('no_documento') id?: string,
  ): Promise<Documento[]> {
    const idNumber = id ? parseInt(id, 10) : undefined;
    return this.gestDocumentalService.buscarPorMSD_O_ID(msd, idNumber);
  }
}
