// src/tipo-documento/tipo-documento.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TbTipoDocumento } from './entities/tb_tipo_documento.entity';

@Injectable()
export class TipoDocumentoService {
  constructor(
    @InjectRepository(TbTipoDocumento)
    private tipoDocRepo: Repository<TbTipoDocumento>,
  ) {}

  async findAll() {
    return this.tipoDocRepo.find();
  }
}
