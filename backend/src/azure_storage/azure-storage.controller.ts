import { Controller, Get, Query } from '@nestjs/common';
import { AzureStorageService } from './azure-storage.service';

@Controller('storage')
export class AzureStorageController {
  constructor(private readonly azureStorageService: AzureStorageService) {}

  @Get('get-sas-url')
  getSasUrl(@Query('filename') filename: string) {
    if (!filename) {
      return { error: 'filename is required' };
    }

    const url = this.azureStorageService.generateSasUrl(filename);
    return { url };
  }
}
