import { IsNotEmpty, IsString } from "class-validator";

export class CreateDoctorDto {
  @IsNotEmpty()
  @IsString()
  session_id: string;
}
