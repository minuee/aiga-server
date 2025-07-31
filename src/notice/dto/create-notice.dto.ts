import { IsBoolean, IsEmpty, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateNoticeDto {

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsBoolean()
  @IsOptional()
  is_active: boolean;
}
