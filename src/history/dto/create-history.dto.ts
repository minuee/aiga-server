import { IsString, IsNotEmpty } from "class-validator";

export class CreateHistoryDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
