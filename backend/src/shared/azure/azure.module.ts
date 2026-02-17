import { Module } from '@nestjs/common';
import { AzureStorageService } from './azure-storage.service';

@Module({
  providers: [AzureStorageService],
  exports: [AzureStorageService], // permite que otros módulos lo usen
})
export class AzureModule {}
