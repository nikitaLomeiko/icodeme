import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class CreateStudyDto {
  @IsString()
  @MaxLength(4000)
  context: string;
}

export class StudyIdDto {
  @IsString()
  @MaxLength(256)
  studyId: string;
}

export class GenerateLevelsDto extends StudyIdDto {
  @IsInt()
  @Min(0)
  moduleIndex: number;
}

export class GenerateStepsDto extends GenerateLevelsDto {
  @IsInt()
  @Min(0)
  levelIndex: number;
}

export class GenerateStepContentDto extends GenerateStepsDto {
  @IsInt()
  @Min(0)
  stepIndex: number;
}
