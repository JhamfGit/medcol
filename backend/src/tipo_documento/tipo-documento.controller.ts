// src/tipo-documento/tipo-documento.controller.ts
import { Controller, Get } from '@nestjs/common';
import { TipoDocumentoService } from './tipo-documento.service';

@Controller('tipo-documentos')
export class TipoDocumentoController {
  constructor(private readonly service: TipoDocumentoService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }
}
