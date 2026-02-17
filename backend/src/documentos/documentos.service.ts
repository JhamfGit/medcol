// src/documentos/documentos.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { AzureStorageService } from '../shared/azure/azure-storage.service';
import { Actividad } from '../dashboard/entities/actividad.entity'; // 👈 nuevo import

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepo: Repository<Documento>,

    @InjectRepository(Actividad)
    private readonly actividadRepo: Repository<Actividad>, // 👈 nuevo repositorio

    private readonly azureService: AzureStorageService,
  ) {}

  async guardarDocumentos(
    idPaciente: number,
    idUsuario: number,
    documentos: { tipo: string; url: string }[],
    esPendiente: boolean,
  ) {
    const registros = documentos.map((doc) => ({
      id_paciente: idPaciente,
      tipo: doc.tipo,
      url: doc.url,
      fecha_registro: new Date(),
      es_pendiente: esPendiente,
      id_usuario: idUsuario,
    }));

    try {
      const result = await this.documentoRepo.save(registros);

      // 👇 registrar actividad reciente
      await this.actividadRepo.save({
        tipo: 'documento',
        descripcion: `Se subieron ${result.length} documento(s)`,
      });

      console.log('✅ Documentos guardados:', result);
      return result;
    } catch (error) {
      console.error('❌ Error al guardar documentos:', error);
      throw error;
    }
  }

  async buscarDocumentos(filters: { cedula?: string; msd?: string }) {
    const qb = this.documentoRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.paciente', 'p');

    if (filters.cedula) {
      qb.andWhere('p.no_documento = :cedula', { cedula: filters.cedula });
    }

    if (filters.msd) {
      qb.andWhere('p.msd = :msd', { msd: filters.msd });
    }

    qb.orderBy('d.fecha_registro', 'DESC');

    const documentos = await qb.getMany();

    documentos.forEach((doc) => {
      if (doc.url && !doc.url.startsWith('http')) {
        (doc as any).fileUrl = this.azureService.generateSasUrl(doc.url);
      } else {
        (doc as any).fileUrl = doc.url;
      }
    });

    return documentos;
  }

  async getEstadoEntregaByPaciente(id_paciente: number): Promise<string> {
    const doc = await this.documentoRepo.findOne({
      where: { id_paciente },
      order: { fecha_registro: 'DESC' },
    });
    if (doc && doc.es_pendiente) return 'P';
    return 'E';
  }
}
