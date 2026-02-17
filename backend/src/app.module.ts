import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IntegracionRfastModule } from './integration_rfast/integration_rfast.module';
import { GestDocumentalModule } from './gest_documental/gest_documental.module';
import { ControlMedicamentosModule } from './control_medicamentos/control_medicamentos.module';
import { AlertasModule } from './alertas/alertas.module';
import { AuditoriasModule } from './auditorias/auditorias.module';
import { AuthModule } from './auth/auth.module';
import { ConnectionModule } from './connection/connection.module';
import { ConfigModule as CustomConfigModule } from './config/config.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { TipoDocumentoModule } from './tipo_documento/tipo-documento.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ProxyModule } from './proxy/proxy.module';
import { AzureStorageController } from './azure_storage/azure-storage.controller';
import { AzureStorageService } from './azure_storage/azure-storage.service';
import { AzureStorageModule } from './azure_storage/azure-storage.module';
import { PendientesModule } from './pendientes/penidentes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EntregasModule } from './entregas/entregas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // DESPUÉS - leyendo desde .env ✅
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'postgres',
      database: 'medcol_db',
      autoLoadEntities: true,
      synchronize: false,
    }),
    AzureStorageModule,
    IntegracionRfastModule,
    GestDocumentalModule,
    ControlMedicamentosModule,
    AlertasModule,
    AuditoriasModule,
    AuthModule,
    ConnectionModule,
    CustomConfigModule,
    ReportsModule,
    UsersModule,
    PacientesModule,
    TipoDocumentoModule,
    DocumentosModule,
    ProxyModule,
    PendientesModule,
    DashboardModule,
    EntregasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
