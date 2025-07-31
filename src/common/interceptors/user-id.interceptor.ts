import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserIdInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    console.log('UserIdInterceptor');
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    let user_id: string | undefined = undefined;
    let is_admin: boolean | undefined = undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        });
        user_id = payload.user_id;
        is_admin = payload.is_admin;
      } catch (e) {
        // 인증 실패 시 예외를 던질 수도 있고, user_id만 undefined로 둘 수도 있음
        // throw new UnauthorizedException('Invalid access token');
      }
    }

    req.user_id = user_id; // 모든 컨트롤러에서 req.user_id로 접근 가능
    req.is_admin = is_admin; // 모든 컨트롤러에서 req.is_admin로 접근 가능

    console.log(`req.user_id: ${req.user_id}, req.is_admin: ${req.is_admin}`);

    return next.handle();
  }
}