import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logging-interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform-interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { UserIdInterceptor } from './common/interceptors/user-id.interceptor';
import { JwtService } from '@nestjs/jwt';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { CustomLoggerService } from './common/utils/logger.service';
import * as expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 커스텀 로거 서비스 인스턴스 생성
  const customLogger = app.get(CustomLoggerService);
  
  app.enableCors({
    //origin: ['http://localhost:3000', 'http://localhost:5000', 'https://aigadev.kormedi.com'],
    origin: (origin:any, callback:any) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://localhost:5001',
        'http://192.168.0.177:3000',
        'http://192.168.0.180:3000',
        'https://aigadev.kormedi.com',
      ];
  
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // 허용
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }); 
  
  app.setGlobalPrefix('api');

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  // 커스텀 로거를 주입하여 예외 필터 설정
  app.useGlobalFilters(new AllExceptionsFilter(customLogger));

  // app.useGlobalInterceptors(new UserIdInterceptor(new JwtService()));

  app.useGlobalInterceptors(new ResponseTransformInterceptor(new Reflector()));
  // 커스텀 로거를 주입하여 로깅 인터셉터 설정
  app.useGlobalInterceptors(new LoggingInterceptor(customLogger));

  const swaggerUser = process.env.SWAGGER_USER || 'admin';
  const swaggerPass = process.env.SWAGGER_PASS || 'password123';
  app.use(
    ['/api/doc', '/api/doc-json'], // Swagger 경로들
    expressBasicAuth({
      users: { [swaggerUser] : swaggerPass },
      challenge: true,
      realm: 'AIGA Swagger Docs',
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('AIGA API Docs')
    .setDescription('AIGA API description by Noh.sn 2025.08')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(`http://localhost:${process.env.PORT}`, 'Local')
    .addServer('https://aigadev.kormedi.com', 'Development')
    .addServer('https://aiga.com', 'Production')
    .addTag('AIGA', 'API 문서입니다.')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, documentFactory);

  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
  
  // 애플리케이션 시작 로그
  customLogger.log(`Application started on port ${process.env.PORT ?? 5000}`, 'Bootstrap');
}
bootstrap();
