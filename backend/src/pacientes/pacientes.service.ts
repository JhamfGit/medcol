// pacientes.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { TbPacientes } from './entities/tb_pacientes.entity';
import { EntregasService } from '../entregas/entregas.service';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(TbPacientes)
    private pacientesRepository: Repository<TbPacientes>,
    private readonly entregasService: EntregasService,
  ) {}

  async findByDocumentoOrMsd(no_documento: string, msd: string) {
    return this.pacientesRepository.findOne({
      where: [{ no_documento }, { msd }],
    });
  }

  async create(createPacienteDto: CreatePacienteDto) {
    const pacienteExistente = await this.findByDocumentoOrMsd(
      createPacienteDto.no_documento,
      createPacienteDto.msd,
    );

    if (pacienteExistente) {
      return pacienteExistente;
    }

    const paciente = this.pacientesRepository.create(createPacienteDto);
    const pacienteGuardado = await this.pacientesRepository.save(paciente);
    //return this.pacientesRepository.save(paciente); linea original del codigo, comentado para realizar pruebas de guardar medicamentos

    // Guardar medicamentos si existen en el DTO
    if ((createPacienteDto as any).medicamentos?.length > 0) {
      await this.entregasService.guardarDesdeAPI(
        (createPacienteDto as any).medicamentos,
        pacienteGuardado.id_paciente,
      );
    }

    return pacienteGuardado;
  }
}
