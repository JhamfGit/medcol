import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendientesService } from './pendientes.service';
import { PendientesController } from './pendientes.controller';
import { Documento } from './entities/docs_pendientes.entity';
import { TbPacientes } from '../pacientes/entities/tb_pacientes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Documento, TbPacientes])],
  controllers: [PendientesController],
  providers: [PendientesService],
})
export class PendientesModule {}
