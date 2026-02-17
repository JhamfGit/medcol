// pacientes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbPacientes } from './entities/tb_pacientes.entity';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { EntregasModule } from '../entregas/entregas.module';
import { Medicamento } from '../medicamentos/entities/medicamento.entity'; // <-- asegúrate de que esta ruta sea correcta

@Module({
  imports: [
    TypeOrmModule.forFeature([TbPacientes, Medicamento]), // <-- aquí agregamos Medicamento
    EntregasModule,
  ],
  providers: [PacientesService],
  controllers: [PacientesController],
  exports: [PacientesService],
})
export class PacientesModule {}

