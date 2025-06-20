import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'Nom du client', example: 'Agence Immobilière Paris' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Nom de la société',
    required: false,
    example: 'Groupe Immobilier France',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  companyName?: string;

  @ApiProperty({
    description: 'Email du client',
    required: false,
    example: 'contact@agence-paris.fr',
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ description: 'Numéro de téléphone', required: false, example: '01 23 45 67 89' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({
    description: 'Adresse du client',
    required: false,
    example: '123 Avenue des Champs-Élysées',
  })
  @IsString()
  @IsOptional()
  address?: string;
}
