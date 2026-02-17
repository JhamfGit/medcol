import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from './entities/docs_pendientes.entity';
import { TbPacientes } from '../pacientes/entities/tb_pacientes.entity';

@Injectable()
export class PendientesService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,

    @InjectRepository(TbPacientes)
    private readonly pacienteRepository: Repository<TbPacientes>,
  ) {}

  async buscarPorMSD_O_ID(
    msd?: string,
    id?: string
  ): Promise<{ paciente: TbPacientes | null; documentos: Documento[] }> {
    try {
      if (!msd && !id) {
        throw new Error('Debe proporcionar MSD o ID para la búsqueda.');
      }

      const paciente = await this.pacienteRepository.findOne({
        where: msd ? { msd } : { no_documento: id },
      });

      if (!paciente) {
        return { paciente: null, documentos: [] };
      }

      const documentos = await this.documentoRepository.find({
        where: { patientId: paciente.id_paciente }, // Asegúrate de que este campo sea correcto según tu entidad
        order: { date: 'DESC' },
      });

      return { paciente, documentos };
    } catch (error) {
      console.error('❌ Error en buscarPorMSD_O_ID:', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}

