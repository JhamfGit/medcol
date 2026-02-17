import { Controller, Get, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('proxy')
export class ProxyController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Get('dispensado')
  async proxyDispensado(@Query() query: any) {
    const { factura, id_documento } = query;

    let url = '';
    if (factura) {
      url = `http://hed08pf9dxt.sn.mynetname.net:8004/api/dispensadojhamfapi?factura=${factura}`;
    } else if (id_documento) {
      url = `http://hed08pf9dxt.sn.mynetname.net:8004/api/dispensadojhamfapidocumento?id_documento=${id_documento}`;
    } else {
      return { error: 'Parámetro requerido: factura o id_documento' };
    }

    const username = this.configService.get<string>('API_USER');
    const password = this.configService.get<string>('API_PASS');
    const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error en proxy:', error.response?.data || error.message);
      return { error: 'Error consultando API externa' };
    }
  }
}
