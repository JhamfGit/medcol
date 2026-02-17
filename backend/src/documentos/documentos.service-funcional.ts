/*
// src/documentos/documentos.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepo: Repository<Documento>,
  ) {}

  async guardarDocumentos(
    idPaciente: number,
    idUsuario: number,
    tipos: string[],
    urls: string[],
  ) {
    const registros = tipos.map((tipo, index) => ({
      id_paciente: idPaciente,
      tipo,
      url: urls[index],
      fecha_registro: new Date(),
      es_pendiente: false,
      id_usuario: idUsuario,
    }));

    return await this.documentoRepo.save(registros);
  }

   /* 2)  NUEVO: Consulta documentos */
/**
 * Busca documentos por cédula o por número MSD.
 * - Si pasas ambos parámetros, se aplica un **OR**.
 */
/* ---- ✨ NUEVO: búsqueda con join a Paciente ---- */
/* async buscarDocumentos(filters: { cedula?: string; msd?: string }) {
    const qb = this.documentoRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.paciente', 'p'); // join

    /*if (filters.cedula) {
      qb.andWhere('p.no_documento ILIKE :no_documento', { no_documento: `%${filters.cedula}%` });
    }*/
/*if (filters.cedula) {
      qb.andWhere('p.no_documento = :cedula', { cedula: filters.cedula });
    }
    if (filters.msd) {
      qb.andWhere('p.msd = :msd', { msd: filters.msd });
    }

    qb.orderBy('d.fecha_registro', 'DESC');

    return qb.getMany(); // devuelve Documento[] con paciente embebido
  }
}
*/

// src/documentos/documentos.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { AzureStorageService } from '../shared/azure/azure-storage.service';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepo: Repository<Documento>,
    private readonly azureService: AzureStorageService,
  ) {}

  async guardarDocumentos(
    idPaciente: number,
    idUsuario: number,
    tipos: string[],
    urls: string[],
    esPendiente: boolean,
  ) {
    const registros = tipos.map((tipo, index) => ({
      id_paciente: idPaciente,
      tipo,
      url: urls[index],
      fecha_registro: new Date(),
      es_pendiente: esPendiente,
      id_usuario: idUsuario,
    }));

    try {
      const result = await this.documentoRepo.save(registros);
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

    // ✅ Asignar `fileUrl` con la URL firmada correctamente
    documentos.forEach((doc) => {
      // Validar que sea un blobName y no una URL ya firmada
      if (doc.url && !doc.url.startsWith('http')) {
        (doc as any).fileUrl = this.azureService.generateSasUrl(doc.url);
      } else {
        (doc as any).fileUrl = doc.url;
      }
    });

    return documentos;
  }
}
