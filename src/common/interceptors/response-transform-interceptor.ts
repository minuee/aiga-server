import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { SKIP_RESPONSE_TRANSFORM } from '../decorators/response-message-decorator';

export interface Response<T> {
  message: string;
  statusCode: number;
  data: T;
}

// {
//   message: "성공적으로 해당 유저가 추가 되었습니다.",
//   statusCode: 200,
//   data: createdUser,
// }

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, any> {

  constructor(private reflector: Reflector) {}


  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_TRANSFORM, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return next.handle();
    }
    
    const res = context.switchToHttp().getResponse();
    const currentStatusCode = res.statusCode;

    const messageFromMetaData = this.reflector
                                  .get<string>('response-message', context.getHandler());
    

    return next.handle().pipe(
      map((data: any) => {
        // 쿠키 설정 처리
        if (data && data.setCookie) {
          const { name, value, options } = data.setCookie;
          res.cookie(name, value, options || {});
        }
        // 실제 응답 데이터 추출
        const responseData = data && data.data !== undefined ? data.data : data;
        return {
          message: messageFromMetaData || responseData?.message || '',
          statusCode: currentStatusCode,
          data: responseData,
        };
      }),
    );
  }
}
