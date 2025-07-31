import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { CustomLoggerService } from '../utils/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private customLogger: CustomLoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : (exception.status || 500);

    // ValidationPipe 에러 메시지 추출
    let response = exception instanceof HttpException
      ? exception.getResponse()
      : null;

    let message = exception instanceof HttpException
      ? exception.message
      : (exception.message || 'Internal server error');

    // class-validator 에러 메시지 배열 처리
    if (response && typeof response === 'object' && (response as any).message) {
      message = (response as any).message;
    }
    
    // 클라이언트 IP 추출
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // 커스텀 로거로 에러 로깅
    this.customLogger.logHttpError(
      status, 
      message, 
      req.originalUrl, 
      ip, 
      exception.stack
    );

    // 기존 console.error도 유지 (개발 편의성)
    console.error(`[Exception] ${status}, ${JSON.stringify(message)}, IP: ${ip}`);
    console.log('----------------------------------------------------------------');
    
    // 응답도 커스텀
    res.status(status).json({
      statusCode: status,
      message,
    });
  }
}