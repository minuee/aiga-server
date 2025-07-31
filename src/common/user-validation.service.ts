// src/common/user-validation.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUserId(user_id: string) {
    const user = await this.prisma.user.findUnique({ where: { user_id } });
    if (!user) {
      throw new UnauthorizedException('존재하지 않는 회원입니다.');
    }
    return user;
  }
}