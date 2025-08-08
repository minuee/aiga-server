import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    // 로그 디렉토리를 ~/logs/aiga-api-server로 설정
    const logDir = process.env.LOG_DIR || path.join(os.homedir(), 'logs', 'aiga-api-server');
    
    // 로그 디렉토리 생성
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // 디버깅: 로그 디렉토리 정보 출력
    try {
      fs.accessSync(logDir, fs.constants.W_OK);
    } catch (error) {
      console.log(`[Logger] Directory writable: No - ${error.message}`);
    }
    // JSON을 예쁘게 출력하는 커스텀 포맷
    const prettyJsonFormat = winston.format.printf((info) => {
      const { level, message, timestamp, context, ...meta } = info;
      // context를 제외한 meta 데이터만 JSON으로 출력
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr ? '\n' + metaStr : ''}`;
    });
    
    // 날짜별 로그 파일 설정
    const dailyRotateFileTransport = new DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '14d', // 14일간 보관
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        prettyJsonFormat
      )
    });

    // 에러 전용 로그 파일
    const errorRotateFileTransport = new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '30d', // 에러 로그는 30일간 보관
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        prettyJsonFormat
      )
    });

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        prettyJsonFormat
      ),
      transports: [
        dailyRotateFileTransport,
        errorRotateFileTransport,
        // 개발 환경에서는 콘솔에도 출력
        ...(process.env.NODE_ENV !== 'production' ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp(),
              winston.format.printf((info) => {
                const { level, message, timestamp, context, ...meta } = info;
                // context를 제외한 meta 데이터만 JSON으로 출력
                const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                return `${timestamp} [${level}]: ${message}${metaStr ? '\n' + metaStr : ''}`;
              })
            )
          })
        ] : [])
      ]
    });

    // 로거 초기화 완료 후 테스트 로그
    this.logger.info('🚀 Logger initialized successfully', {
      logDir,
      nodeEnv: process.env.NODE_ENV,
      logLevel: process.env.LOG_LEVEL || 'info',
      type: 'logger_init'
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  // HTTP 요청 로깅
  logHttpRequest(method: string, url: string, params: string, query: string, ip: string, userAgent?: string) {
    this.logger.info('🔵 HTTP REQUEST', {
      method,
      url,
      params,
      query,
      ip,
      userAgent,
      type: 'http_request',
      timestamp: new Date().toISOString()
    });
  }

  // HTTP 응답 로깅
  logHttpResponse(responseTime: number, statusCode: number, message: string) {
    const emoji = statusCode >= 200 && statusCode < 300 ? '🟢' : '🔴';
    this.logger.info(`${emoji} HTTP RESPONSE`, {
      responseTime: `${responseTime}ms`,
      statusCode,
      responseMessage: message,
      type: 'http_response',
      timestamp: new Date().toISOString()
    });
  }

  // HTTP 에러 로깅
  logHttpError(statusCode: number, message: string, url: string, ip: string, stack?: string) {
    this.logger.error('🚨 HTTP ERROR', {
      statusCode,
      message,
      url,
      ip,
      stack,
      type: 'http_error',
      timestamp: new Date().toISOString()
    });
  }

  // 비즈니스 로직 로깅
  logBusiness(level: 'info' | 'warn' | 'error', message: string, data?: any, context?: string) {
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    
    const logMethod = this.logger[level];
    logMethod(`${emoji[level]} BUSINESS LOG`, { 
      message, 
      data, 
      context, 
      type: 'business',
      timestamp: new Date().toISOString()
    });
  }
} 