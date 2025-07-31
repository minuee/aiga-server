// src/common/user-validation.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AdminValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validateAdminId(user_id: string) {
    const admin = await this.prisma.admin.findUnique({ where: { admin_id:user_id } });
    if (!admin) {
      throw new UnauthorizedException('존재하지 않는 관리자입니다.');
    }
    return admin;
  }
}