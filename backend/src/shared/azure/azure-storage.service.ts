// src/shared/azure/azure-storage.service.ts
import { Injectable } from '@nestjs/common';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  SASProtocol,
  BlobSASPermissions,
} from '@azure/storage-blob';

@Injectable()
export class AzureStorageService {
  private readonly containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;
  private readonly accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
  private readonly accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;

  private readonly credential = new StorageSharedKeyCredential(
    this.accountName,
    this.accountKey,
  );

  generateSasUrl(blobName: string): string {
    const startsOn = new Date(Date.now() - 5 * 60 * 1000); // hace 5 minutos
    const expiresOn = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas después


    const sasParams = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
      },
      this.credential,
    );

    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}?${sasParams.toString()}&response-content-disposition=attachment`;
  }
}

