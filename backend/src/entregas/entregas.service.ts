// src/entregas/entregas.service.ts
/*import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IntegracionRfastService } from '../integration_rfast/integration_rfast.service';
import { Repository } from 'typeorm';
import { Entrega } from './entities/entrega.entity';
import { TbPacientes } from '../pacientes/entities/tb_pacientes.entity';

@Injectable()
export class EntregasService {
  constructor(
    @InjectRepository(Entrega)
    private readonly entregaRepo: Repository<Entrega>,
    @InjectRepository(TbPacientes)
    private readonly pacienteRepo: Repository<TbPacientes>,
    private readonly integracionRfast: IntegracionRfastService,
  ) {}

  async guardarDesdeAPI(msd: string, id_usuario: number) {
    // 1) Busca al paciente
    const paciente = await this.pacienteRepo.findOne({ where: { msd } });
    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // 2) Llama a Rfast y extrae el array de medicamentos
    let resultado: any;
    try {
      resultado = await this.integracionRfast.obtenerDatosDeRfast({ msd });
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Error al obtener datos de Rfast: ' + e.message,
      );
    }

    const medicamentos = Array.isArray(resultado.data) ? resultado.data : [];

    console.log('Medicamentos extraídos de Rfast:', medicamentos);

    // 3) Si no hay medicamentos, devolvemos sin error
    if (medicamentos.length === 0) {
      return { message: 'No hay medicamentos para guardar.' };
    }

    // 4) Mapeamos y guardamos
    const entregas = medicamentos.map((med) =>
      this.entregaRepo.create({
        id_paciente: paciente.id_paciente,
        id_usuario,
        estado: med.estado || 'P',
        codigo: med.codigo,
        nombre_generico: med.nombre_generico,
        concentracion: med.concentracion || null,
        fecha_suministro: med.fecha_suministro
          ? new Date(med.fecha_suministro)
          : null,
        id_medicamento: med.id_medicamento || null,
      }),
    );

    try {
      await this.entregaRepo.save(entregas);
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Error al guardar entregas: ' + e.message,
      );
    }

    return { message: 'Medicamentos guardados', count: entregas.length };
  }
}
*/
// src/entregas/entregas.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entrega } from './entities/entrega.entity';
import { TbPacientes } from '../pacientes/entities/tb_pacientes.entity';
import { TbMedicamentos } from './entities/tb_medicamentos.entity';
import { IntegracionRfastService } from '../integration_rfast/integration_rfast.service';

@Injectable()
export class EntregasService {
  constructor(
    @InjectRepository(Entrega)
    private readonly entregaRepo: Repository<Entrega>,
    @InjectRepository(TbPacientes)
    private readonly pacienteRepo: Repository<TbPacientes>,
    @InjectRepository(TbMedicamentos)
    private readonly medicamentosRepo: Repository<TbMedicamentos>,
    private readonly integracionRfast: IntegracionRfastService,
  ) { }

  /** Devuelve todas las entregas, opcionalmente filtradas por estado */
  // src/entregas/entregas.service.ts
  async findAll(estado?: string): Promise<Entrega[]> {
    const where = estado ? { estado } : {};
    return this.entregaRepo.find({
      where,
      relations: ['paciente'], // <— aquí cargas la relación
      order: { fecha_suministro: 'DESC' },
    });
  }

  async guardarDesdeAPI(msd: string, id_usuario: number) {
    // 1) Busca al paciente
    const paciente = await this.pacienteRepo.findOne({ where: { msd } });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    // 2) Obtiene el objeto { data: [...] } de Rfast
    let resultado: any;
    try {
      resultado = await this.integracionRfast.obtenerDatosDeRfast({ msd });
    } catch (err: any) {
      throw new InternalServerErrorException(
        'Error al obtener datos de Rfast: ' + err.message,
      );
    }

    const meds: any[] = Array.isArray(resultado.data) ? resultado.data : [];
    console.log('📦 Datos crudos de Rfast para msd:', msd, meds);

    if (meds.length === 0) {
      return { message: 'No hay medicamentos para guardar.' };
    }

    // 3) Guarda el lote de entregas
    const entregas = meds.map((m) =>
      this.entregaRepo.create({
        id_paciente: paciente.id_paciente,
        id_usuario,
        estado: m.estado || 'P',
        codigo: m.codigo,
        nombre_generico: m.nombre_generico,
        concentracion: m.concentracion || null,
        fecha_suministro: m.fecha_suministro
          ? new Date(m.fecha_suministro)
          : undefined,
        id_medicamento: m.id_medicamento ?? null,
        cantidad_ordenada: parseInt(m.numero_unidades, 10),
      }),
    );

    try {
      await this.entregaRepo.save(entregas);
    } catch (err: any) {
      throw new InternalServerErrorException(
        'Error al guardar entregas: ' + err.message,
      );
    }

    // 4) Upsert en tb_medicamentos para cada nombre_generico
    //    Usamos `upsert` para no duplicar entradas ya existentes.
    //    La columna nombre_generico debe tener constraint UNIQUE.
    const medsToUpsert = meds.map((m) => ({
      nombre_generico: m.nombre_generico,
    }));
    try {
      await this.medicamentosRepo.save(
        medsToUpsert.map((m) => this.medicamentosRepo.create(m)),
      );
    } catch (err: any) {
      // no detenemos el flujo si falla el upsert, sólo lo logueamos
      console.warn('Warning al upsert tb_medicamentos:', err.message);
    }

    return { message: 'Medicamentos guardados', count: entregas.length };
  }
}
