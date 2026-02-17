import { Injectable } from '@nestjs/common';
import {
  BlobSASPermissions,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  SASProtocol,
  BlobSASSignatureValues
} from '@azure/storage-blob';

@Injectable()
export class AzureStorageService {
  private accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  private accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  private containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

  constructor() {
    console.log('🌐 containerName:', this.containerName);
    console.log('🌐 accountName:', this.accountName);
    console.log('🌐 accountKey:', this.accountKey ? '[HIDDEN]' : '❌ No definido');
  }

  generateSasUrl(blobName: string): string {
    // Validar que las variables estén definidas
    if (!this.accountName || !this.accountKey || !this.containerName) {
      throw new Error('Faltan variables de entorno para Azure Storage');
    }

    // Crear credencial compartida
    const credential = new StorageSharedKeyCredential(
      this.accountName,
      this.accountKey,
    );
    // Crear el objeto de parámetros para la firma SAS
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 días (≈ 3 meses)


    const sasParams = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'), // permiso de lectura
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
      },
      credential,
    );

    const sasToken = sasParams.toString();

    // Construir la URL final con el SAS
    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}?${sasToken}`;
  }

}

  


