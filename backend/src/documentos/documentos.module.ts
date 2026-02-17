// src/documentos/documentos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentosController } from './documentos.controller';
import { UploadService } from './upload.service';
import { DocumentosService } from './documentos.service';
import { Documento } from './entities/documento.entity';
import { Actividad } from '../dashboard/entities/actividad.entity'; // 👈 importar Actividad
import { AzureModule } from '../shared/azure/azure.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documento, Actividad]), // ✅ incluir Actividad aquí
    AzureModule,
    AuthModule,
  ],
  controllers: [DocumentosController],
  providers: [UploadService, DocumentosService],
})
export class DocumentosModule { }
