import { IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";

export class UserDto implements User {

  @ApiProperty({
    // required: true,
    type: String,
    description: 'user id',
  })
  @IsNumber()
  user_id: string;
  
  @ApiProperty({
    required: true,
    type: String,
    description: 'SNS 타입',
    example: '0',
    // default: 'test@test.com',
  })
  @IsNotEmpty()
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
  @ApiProperty({
    // required: true,
    type: String,
    description: '프로필사진',
    example: '/images/profile/default.png',
    // default: 'test@test.com',
  })
  nickname: string;
  
  @ApiProperty({
    // required: true,
    type: String,
    description: '프로필사진',
    example: '/images/profile/default.png',
  })
  @IsString()
  profile_img: string;

  @ApiProperty({
    description: '가입일',
    example: '2025-05-16T04:19:41.848Z'
  })
  regist_date: Date;

  @ApiProperty({
    description: '탈퇴일',
    example: '2025-05-16T04:19:41.848Z'
  })
  unregist_date: Date;

  @ApiProperty({
    description: '약관 동의',
    example: 'true'
  })
  agreement: boolean;

  @ApiProperty({
    description: '생성일',
    example: '2025-05-16T04:19:41.848Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2025-05-16T04:19:41.848Z'
  })
  updatedAt: Date;

  @ApiProperty({
    description: '마지막 로그인일자',
    example: '2025-05-16T04:19:41.848Z'
  })
  lastLoginAt: Date;
}
