import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IntegracionRfastService } from './integration_rfast.service';
import { IntegracionRfastController } from './integration_rfast.controller';

@Module({
  imports: [HttpModule],
  controllers: [IntegracionRfastController],
  providers: [IntegracionRfastService],
})
export class IntegracionRfastModule {}

