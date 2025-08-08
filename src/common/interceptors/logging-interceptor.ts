import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLoggerService } from '../utils/logger.service';

const run_mode = (process.env.RUN_MODE)?.toLowerCase();

const statusMessages: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
  // 필요한 코드만 추가
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private customLogger: CustomLoggerService) {
    this.logger.log(`LoggingInterceptor, run_mode: ${run_mode}`);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const { method, originalUrl, params, query, body, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';

    const req_body = JSON.stringify(body, null, 2);

    // 커스텀 로거로 HTTP 요청 로깅
    this.customLogger.logHttpRequest(method, originalUrl, 
      JSON.stringify(params), JSON.stringify(query), ip, userAgent);
    
    // 요청 body 로깅 (개발 모드에서만)
    if(run_mode !== 'prod' && body !== undefined) {
      // this.customLogger.logBusiness('info', 'Request Body', body, 'HTTP Request');
      this.customLogger.log(req_body, 'HTTP Request body');
    }

    const startTime = Date.now();
    return next
      .handle()
      .pipe(
        tap((data) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const statusCode = res.statusCode;
          const message = res.statusMessage || statusMessages[statusCode] || '';
          
          let res_body = ''
          if(run_mode !== 'prod') {
            res_body = JSON.stringify(data, null, 2);
          }

          // 커스텀 로거로 HTTP 응답 로깅
          this.customLogger.logHttpResponse(responseTime, statusCode, message);
          
          // 응답 body 로깅 (개발 모드에서만)
          if(run_mode !== 'prod') {
            // this.customLogger.logBusiness('info', 'Response Body', data, 'HTTP Response');
            this.customLogger.log(res_body, 'HTTP Response body');
          }
          
        }),
      );
  }
}
