import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateDocumentDto {
  @IsUUID()
  projectId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  fileType?: string;

  @IsString()
  storageUrl: string;

  @IsUUID()
  @IsOptional()
  uploadedByUserId?: string;
}
