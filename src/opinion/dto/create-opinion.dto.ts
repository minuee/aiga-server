import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateOpinionDto {

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsNumber()
  @IsOptional()
  opinion_type: number;

  @IsOptional()
  memo: string;
}
