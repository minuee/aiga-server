import { IsNumber, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateReviewDto {

  @IsNumber()
  @IsNotEmpty()
  doctor_id: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  total_score: number;

  @IsNumber()
  @IsOptional()
  kindness_score: number;

  @IsNumber()
  @IsOptional()
  explaination_score: number;

  @IsNumber()
  @IsOptional()
  satisfaction_score: number;

  @IsNumber()
  @IsOptional()
  recommand_score: number;
}
