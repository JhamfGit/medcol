// src/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Documento } from './entities/documento.entity';
import { Medicamento } from './entities/entrega.entity';
import { Actividad } from './entities/actividad.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documento, Medicamento, Actividad])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [TypeOrmModule], // ✅ Esto permite que otros módulos usen ActividadRepository
})
export class DashboardModule {}


