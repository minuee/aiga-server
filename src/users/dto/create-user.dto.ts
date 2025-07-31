import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {

  user_id: string;
  
  @ApiProperty({
    required: true,
    type: String,
    description: 'SNS 타입',
    example: '0',
    // default: 'test@test.com',
  })
  @IsNotEmpty()
  @IsString()
  sns_type: string;

  @ApiProperty({
    required: true,
    type: String,
    description: 'SNS id',
    example: '12345678',
    // default: 'test@test.com',
  })
  @IsNotEmpty()
  @IsString()
  sns_id: string;

  @ApiProperty({
    required: true,
    type: String,
    description: '이메일',
    example: 'test@test.com',
    // default: 'test@test.com',
    // minLength: 1,
    maxLength: 255,
  })
  @IsEmail({}, { message: "이메일 형식이 올바르지 않습니다." })
  @IsString()
  email: string;

  @ApiProperty({
    // required: true,
    type: String,
    description: '닉네임',
    example: '나르는돼지',
    // default: 'test@test.com',
  })
  @IsString()
  @MinLength(2, {
    message: '닉네일 최소 길이는 $constraint1자 입니다. 입력된 값: $value',
  })@MaxLength(32, {
    message: '닉네일 최대 길이는 $constraint1자 입니다. 입력된 값: $value',
  })
  @IsOptional()
  nickname: string;
  
  @ApiProperty({
    // required: true,
    type: String,
    description: '프로필사진',
    example: '/images/profile/default.png',
  })
  @IsString()
  @IsOptional()
  profile_img: string;

  @ApiProperty({
    description: '약관 동의',
    example: 'true'
  })
  @IsBoolean()
  agreement: boolean;
}
