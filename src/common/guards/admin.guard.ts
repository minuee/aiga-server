import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminValidationService } from 'src/common/admin-validation.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly adminValidationService: AdminValidationService, 
    private readonly jwtService: JwtService,
    private reflector: Reflector) 
  {

  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const GuardPass = this.reflector.get<boolean>('GuardPass', context.getHandler());
    if (GuardPass) {
      console.log(`AdminGuard, canActivate passed by @GuardPass`);
      return true;
    }
    console.log('AdminGuard, canActivate');   
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    let user_id: string;
    let is_admin: boolean | undefined = undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        });
        user_id = payload.user_id ?? '';
        is_admin = payload.is_admin;

        console.log(`user_id: ${user_id}, is_admin: ${is_admin}`);

        if(!user_id ) {
          throw new UnauthorizedException('관리자 인증이 필요합니다.');
        }

        if(!is_admin) {
          throw new ForbiddenException('관리자 권한이 필요합니다.');
        }
        await this.adminValidationService.validateAdminId(user_id);

        req.user_id = user_id;
        req.is_admin = is_admin;

      } catch (e) {
        console.log(e);
        throw new UnauthorizedException(e.message);
      }
    }
    else {
      throw new UnauthorizedException('관리자 인증이 필요합니다.');
    }

    return true;
    
  }
}

/*
export function AdminGuard(is_active: boolean = true): any {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    constructor(
      private readonly adminValidationService: AdminValidationService, 
      private readonly jwtService: JwtService) 
    {

    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      if (!is_active) {
        console.log(`AdminGuard, canActivate passed by is_active(${is_active}`);
        return true;
      }
      console.log('AdminGuard, canActivate');
      
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers['authorization'];
      let user_id: string;
      let is_admin: boolean | undefined = undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_ACCESS_SECRET,
          });
          user_id = payload.user_id ?? '';
          is_admin = payload.is_admin;

          console.log(`user_id: ${user_id}, is_admin: ${is_admin}`);

          if(!user_id ) {
          throw new UnauthorizedException('관리자 인증이 필요합니다.');
          }

          if(!is_admin) {
            throw new ForbiddenException('관리자 권한이 필요합니다.');
          }
          await this.adminValidationService.validateAdminId(user_id);

          req.user_id = user_id;
          req.is_admin = is_admin;

        } catch (e) {
          console.log(e);
          // throw new UnauthorizedException('Invalid access token');
          throw new UnauthorizedException(e.message);
        }
      }
      else {
        throw new UnauthorizedException('관리자 인증이 필요합니다.');
      }

      return true;
      
    }
  }

  return RoleGuardMixin;
}
*/