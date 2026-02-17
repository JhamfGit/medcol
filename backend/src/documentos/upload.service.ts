// src/documentos/upload.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlobServiceClient,
  ContainerClient,
} from '@azure/storage-blob';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;
  private accountName: string;
  private accountKey: string;

  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    this.accountName = this.configService.get<string>('AZURE_STORAGE_ACCOUNT_NAME')!;
    this.accountKey = this.configService.get<string>('AZURE_STORAGE_ACCOUNT_KEY')!;

    if (!connectionString) {
      this.logger.error('AZURE_STORAGE_CONNECTION_STRING no está definido en el entorno');
      throw new Error('AZURE_STORAGE_CONNECTION_STRING no está definido en el entorno');
    }
    if (!this.accountName || !this.accountKey) {
      this.logger.error('AZURE_STORAGE_ACCOUNT_NAME o AZURE_STORAGE_ACCOUNT_KEY no definidos');
      throw new Error('AZURE_STORAGE_ACCOUNT_NAME o AZURE_STORAGE_ACCOUNT_KEY no definidos');
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerName = 'medcoldocsimg';
    this.containerClient = this.blobServiceClient.getContainerClient(containerName);
  }

  async uploadFiles(files: Express.Multer.File[], folder: string): Promise<string[]> {
    await this.containerClient.createIfNotExists();

    const uploadedBlobNames: string[] = [];

    for (const file of files) {
      const blobName = `${folder}/${Date.now()}_${file.originalname}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });

      // ✅ GUARDAR solo el blobName (NO la URL SAS)
      uploadedBlobNames.push(blobName);
    }

    return uploadedBlobNames;
  }
}

