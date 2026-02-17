// src/entregas/entregas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { Entrega } from './entities/entrega.entity';
import { TbPacientes } from '../pacientes/entities/tb_pacientes.entity';
import { EntregasService } from './entregas.service';
import { EntregasController } from './entregas.controller';
import { IntegracionRfastService } from '../integration_rfast/integration_rfast.service';
import { TbMedicamentos } from './entities/tb_medicamentos.entity';

@Module({
  imports: [
    // Ahora incluimos las dos entidades:
    TypeOrmModule.forFeature([Entrega, TbPacientes, TbMedicamentos]),
    HttpModule,
  ],
  controllers: [EntregasController],
  providers: [
    EntregasService,
    IntegracionRfastService, // si no lo provee IntegrationRfastModule
  ],
  exports: [EntregasService], // para poder inyectarlo en PacientesModule
})
export class EntregasModule {}
