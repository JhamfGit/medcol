import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GestDocumentalService } from './gest_documental.service';
import { GestDocumentalController } from './gest_documental.controller';
import { Documento } from './entities/documento.entity';
import { TbPacientes } from '../pacientes/entities/tb_pacientes.entity';


@Module({
  // gest_documental.module.ts
imports: [
  TypeOrmModule.forFeature([Documento, TbPacientes]), // Asegúrate de importar la entidad Documento y TbPacientes
  
],

  controllers: [GestDocumentalController],
  providers: [GestDocumentalService],
})
export class GestDocumentalModule {}

