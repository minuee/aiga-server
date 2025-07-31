// src/common/common.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { UserValidationService } from './user-validation.service';
import { AdminValidationService } from './admin-validation.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { CustomLoggerService } from './utils/logger.service';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION },
    }),
  ],
  providers: [UserValidationService, AdminValidationService, JwtService, PrismaService, CustomLoggerService],
  exports: [UserValidationService, AdminValidationService, JwtService, PrismaService, CustomLoggerService],
})
export class CommonModule {}