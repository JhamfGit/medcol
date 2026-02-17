// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { Medicamento } from './entities/entrega.entity';
import { Actividad } from './entities/actividad.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Documento)
    private documentoRepo: Repository<Documento>,

    @InjectRepository(Medicamento)
    private medicamentoRepo: Repository<Medicamento>,

    @InjectRepository(Actividad)
    private actividadRepo: Repository<Actividad>,
  ) {}

  async getDashboardStats() {
    const documentosPendientes = await this.documentoRepo.count({
      where: { es_pendiente: true },
    });

    const medicamentosPendientes = await this.medicamentoRepo.count({
      where: { estado: 'pendiente' },
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);

    const documentosHoy = await this.documentoRepo.count({
      where: {
        fecha_registro: Between(hoy, mañana),
      },
    });

    return {
      documentosPendientes,
      medicamentosPendientes,
      documentosHoy,
    };
  }

  async getActividadReciente() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);

    return this.actividadRepo.find({
      where: {
        fecha: Between(hoy, mañana),
      },
      order: {
        fecha: 'DESC',
      },
    });
  }
}
