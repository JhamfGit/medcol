// src/tipo-documento/tipo-documento.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbTipoDocumento } from './entities/tb_tipo_documento.entity';
import { TipoDocumentoController } from './tipo-documento.controller';
import { TipoDocumentoService } from './tipo-documento.service';

@Module({
  imports: [TypeOrmModule.forFeature([TbTipoDocumento])],
  controllers: [TipoDocumentoController],
  providers: [TipoDocumentoService],
})
export class TipoDocumentoModule {}
