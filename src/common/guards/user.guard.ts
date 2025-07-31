import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserValidationService } from 'src/common/user-validation.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly userValidationService: UserValidationService,
    private readonly jwtService: JwtService,
    private reflector: Reflector) 
    {

    }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const GuardPass = this.reflector.get<boolean>('GuardPass', context.getHandler());
    if (GuardPass) {
      console.log(`UserGuard, canActivate passed by @GuardPass`);
      return true;
    }
    console.log('UserGuard, canActivate');
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    let user_id: string;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        });
        user_id = payload.user_id ?? '';

        console.log(`user_id: ${user_id}`);

        if(!user_id) {
          throw new UnauthorizedException('회원 인증이 필요합니다.');
        }
        await this.userValidationService.validateUserId(user_id);

        req.user_id = user_id;

      } catch (e) {
        console.log(e);
        // throw new UnauthorizedException('Invalid access token');
        throw new UnauthorizedException(e.message);
      }
    }
    else {
      throw new UnauthorizedException('회원 인증이 필요합니다.');
    }
    
    return true;
  }
}