import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreatePacienteDto {
  @IsString()
  @Length(1, 20)
  msd: string;

  @IsString()
  nombre: string;

  @IsString()
  @Length(1, 20)
  no_documento: string;

  @IsInt()
  id_tipo_documento: number;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  regimen?: string;

  @IsOptional()
  @IsString()
  medico?: string;

  @IsOptional()
  @IsString()
  drogueria?: string;

  @IsInt()
  id_usuario: number;

  @IsOptional()
  @IsArray()
  medicamentos?: any[];
}
