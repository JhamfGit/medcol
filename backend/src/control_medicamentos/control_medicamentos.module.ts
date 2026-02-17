import { Module } from '@nestjs/common';
import { ControlMedicamentosController } from './control_medicamentos.controller';
import { ControlMedicamentosService } from './control_medicamentos.service';

@Module({
  controllers: [ControlMedicamentosController],
  providers: [ControlMedicamentosService],
})
export class ControlMedicamentosModule {}
