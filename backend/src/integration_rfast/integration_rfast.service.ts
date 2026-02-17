import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IntegracionRfastService {
  private readonly baseDocumentoUrl = 'http://hed08pf9dxt.sn.mynetname.net:8004/api/dispensadojhamfapidocumento';
  private readonly baseMsdUrl = 'http://hed08pf9dxt.sn.mynetname.net:8004/api/dispensadojhamfapi';
  private readonly authUrl = 'http://hed08pf9dxt.sn.mynetname.net:8004/api/acceso';

  constructor(private readonly httpService: HttpService) {}

  private async obtenerToken(): Promise<string> {
    const body = {
      name: 'Api Consulta Jhamf',
      email: 'hquiceno@jhamf.com',
      password: 'Jh@mfi2eMic',
    };

    const response = await firstValueFrom(
      this.httpService.post(this.authUrl, body)
    );

    const token = response.data.token ?? response.data.access_token;

    if (!token) {
      throw new Error('No se pudo obtener el token de autenticación de Rfast');
    }

    return token;
  }

  async obtenerDatosDeRfast(params: { documento?: string; msd?: string }): Promise<any> {
    const token = await this.obtenerToken();

    let url: string;

    if (params.documento) {
      url = `${this.baseDocumentoUrl}?id_documento=${params.documento}`;
    } else if (params.msd) {
      url = `${this.baseMsdUrl}?factura=${params.msd}`;
    } else {
      throw new Error('Debe proporcionar un documento o un msd para la consulta.');
    }

    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    return response.data;
  }
}

