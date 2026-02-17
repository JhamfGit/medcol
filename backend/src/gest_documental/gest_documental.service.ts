// gest_documental/gest_documental.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { TbPacientes } from '../pacientes/entities/tb_pacientes.entity';

@Injectable()
export class GestDocumentalService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,
    @InjectRepository(TbPacientes)
    private readonly pacienteRepository: Repository<TbPacientes>,
  ) {}

  async buscarPorMSD_O_ID(msd?: string, id?: number): Promise<Documento[]> {
    try {
      if (!msd && !id) {
        throw new Error('Debe proporcionar MSD o ID para la búsqueda.');
      }

      const query = this.documentoRepository
        .createQueryBuilder('documento')
        .leftJoinAndSelect('documento.id_paciente', 'paciente')


      if (msd) {
        query.andWhere('paciente.msd = :msd', { msd });
      }

      if (id) {
        query.andWhere('paciente.no_documento = :id', { id });
      }

      const resultados = await query.getMany();
      console.log(JSON.stringify(resultados, null, 2)); // <- agrega esto

      return resultados;
    } catch (error) {
      console.error('❌ Error en buscarPorMSD_O_ID:', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}


