import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ProjectMetaDto {
  @IsString()
  @MaxLength(128)
  name: string;

  @IsString()
  @MaxLength(256)
  title: string;

  @IsString()
  @MaxLength(1000)
  subtitle: string;

  @IsString()
  @MaxLength(64)
  language: string;
}

export class FileNodeDto {
  @IsString()
  @MaxLength(128)
  id: string;

  @IsString()
  @MaxLength(128)
  name: string;

  @IsIn(['file', 'folder'])
  type: 'file' | 'folder';

  @IsString()
  @MaxLength(5 * 1024 * 1024)
  content: string;

  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => FileNodeDto)
  children: FileNodeDto[];
}

export class ProjectDto {
  @IsString()
  @MaxLength(128)
  _id: string;

  @IsString()
  @MaxLength(128)
  userId: string;

  @ValidateNested()
  @Type(() => ProjectMetaDto)
  meta: ProjectMetaDto;

  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => FileNodeDto)
  dir: FileNodeDto[];

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}

export class RunContainerDto {
  @ValidateNested()
  @Type(() => ProjectDto)
  project: ProjectDto;

  @IsString()
  @Matches(/^[0-9a-f-]{36}$/i)
  stepId: string;
}

export class ContainerDto {
  @IsString()
  @Matches(/^[a-f0-9]{64}$/)
  containerId: string;
}

export class SendContainerInputDto extends ContainerDto {
  @IsString()
  @MaxLength(65_536)
  input: string;
}
