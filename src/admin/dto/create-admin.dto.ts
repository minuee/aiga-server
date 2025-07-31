import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from "class-validator";


export class CreateAdminDto {

  @IsString()
  @IsOptional()
  admin_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  parent_id: string;

  @IsBoolean()
  @IsOptional()
  is_active: boolean;
}
