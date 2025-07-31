<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# AIGA API Server

## Description

AIGA API 서버는 NestJS 프레임워크를 기반으로 한 의료 AI 챗봇 API 서버입니다.

## Project setup

```bash
$ npm install
```

## Environment Variables

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Run Mode
RUN_MODE=LOCAL

# 서버 주소, 포트트
DOMAIN=http://localhost
PORT=5000

# Database(디비종류://유저이름:비번@url:/디비이름, 스키마)
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# JWT
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
ACCESS_TOKEN_EXPIRATION=365d
REFRESH_TOKEN_EXPIRATION=365d

# Server
NODE_ENV=development

# LLM Server
LLM_SERVER_HOST=localhost
LLM_SERVER_PORT=8000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Token Limits
USER_MAX_TOKEN=100000
GUEST_MAX_TOKEN=100000

// 재가입 제한 시간(day)
REJOIN_BLOCK_PERIOD=1
```

## Logging System

이 프로젝트는 Winston을 사용한 통합 로그 시스템을 제공합니다:

### 로그 파일 위치
- 기본 위치: `~/logs/aiga-api-server/`
- 일반 로그: `application-YYYY-MM-DD.log`
- 에러 로그: `error-YYYY-MM-DD.log`

### 로그 보관 정책
- 일반 로그: 14일간 보관
- 에러 로그: 30일간 보관
- 자동 압축 및 정리

### 로그 레벨
- `LOG_LEVEL` 환경 변수로 설정 가능 (기본값: info)
- 지원 레벨: error, warn, info, debug, verbose

### 로그 타입
- **HTTP Request**: 모든 HTTP 요청/응답 로깅
- **HTTP Error**: 예외 발생 시 상세 로깅
- **Business**: 비즈니스 로직 로깅

## Redis서버 설치
```bash
# 패키지 갱신
$ sudo apt update

# redis 서버 설치
$ sudo apt install redis-server

# 상태 확인
$ sudo systemctl status redis-server
	[start, stop, restart, status]

# 설정 파일
$ /etc/redis/redis.conf
	
# redis 연결 테스트
$ redis-cli ping
	
# 기본 방화벽 설정(필요시)
$ sudo ufw allow 6379
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Deployment

운영 환경 배포 시:

```bash
# 로그 디렉토리 생성
mkdir -p ~/logs/aiga-api-server

# 애플리케이션 시작
sudo nohup npm run start:prod > /dev/null 2>&1 &
```

## 운영 스크립트

```bash
# 시작
$ ./start.sh

# 중지
$ ./stop.sh

# 상태(로그) 확인
$ tail -f ~/logs/aiga-api-server/application-날짜.log
```

## API Documentation

애플리케이션 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- http://localhost:5000/api/doc

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
