import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { IntegracionRfastService } from './integration_rfast.service';

@Controller('integracion-rfast')
export class IntegracionRfastController {
  constructor(private readonly rfastService: IntegracionRfastService) {}

  @Get('datos')
  async traerDatos(
    @Query('id_documento') documento?: string,
    @Query('factura') msd?: string
  ) {
    if (!documento && !msd) {
      throw new BadRequestException('Debe enviar id_documento o factura para consultar.');
    }

    return this.rfastService.obtenerDatosDeRfast({ documento, msd });
  }

}
