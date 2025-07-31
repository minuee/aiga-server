import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, Sse, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Request, Response } from 'express';
import { ResponseMesssage } from 'src/common/decorators/response-message-decorator';
import { JwtService } from '@nestjs/jwt';
import { interval, map, Observable, Subject, finalize } from 'rxjs';
import { RedisService } from 'src/common/utils/redis.service';

@Controller('chat')
export class ChatController {
  // 각 사용자별 독립적인 스트림을 위한 Map
  private userStreams = new Map<string, Subject<MessageEvent>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private redisService: RedisService
  ) {}

  @Sse('stream/:user_id')
  sendEvents(@Param('user_id') user_id: string): Observable<MessageEvent> {
    console.log(`SSE 연결됨 - User ID: ${user_id}`);
    
    // 사용자별 독립적인 Subject 생성 또는 기존 것 사용
    let userStream = this.userStreams.get(user_id);
    if (!userStream) {
      userStream = new Subject<MessageEvent>();
      this.userStreams.set(user_id, userStream);
    }
    
    return userStream.asObservable().pipe(
      finalize(() => {
        console.log(`SSE 연결 해제됨 - User ID: ${user_id}`);
        // 다른 연결이 없으면 Map에서 제거
        if (!userStream.observed) {
          this.userStreams.delete(user_id);
        }
      })
    );
  }

  // 특정 사용자에게만 이벤트 전송하는 메서드
  private sendChatEventToUser(user_id: string, data: any) {
    const userStream = this.userStreams.get(user_id);
    if (userStream) {
      userStream.next(new MessageEvent('chat', { data: JSON.stringify(data) }));
    }
  }

  // 스트리밍 방식으로 특정 사용자에게 텍스트를 나누어 전송하는 메서드
  private async sendStreamingChatEventToUser(user_id: string, result: any, chunkSize: number = 50) {
    const answer = result.answer;
    
    // answer가 문자열인 경우에만 스트리밍
    if (typeof answer === 'string') {
      const chunks = this.splitTextIntoChunks(answer, chunkSize);
      
      for (let i = 0; i < chunks.length; i++) {
        this.sendChatEventToUser(user_id, {
          type: 'streaming',
          session_id: result.session_id,
          chat_type: result.chat_type,
          chunk: chunks[i],
          chunkIndex: i,
          totalChunks: chunks.length,
          isComplete: i === chunks.length - 1
        });
        
        // 각 청크 사이에 약간의 지연 추가 (선택사항)
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      // 객체인 경우 한번에 전송
      this.sendChatEventToUser(user_id, result);
    }
  }

  // 텍스트를 청크로 분할하는 헬퍼 메서드
  private splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async getUserId(req: Request) {
    const authHeader = req.headers['authorization'];
    let user_id: string = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        });
        user_id = payload.user_id;
      } catch (e) {
        console.log(e);
        throw new UnauthorizedException(e.message);
      }
    }
    else {
      // user_id가 없으면 guest_id를 사용
      user_id = req.cookies['guest_id'];
      console.log('guest_id:', user_id);
      // guest_id도 없으면 예외 발생
      if(!user_id) {
        throw new UnauthorizedException('비회원, guest_id not found in cookies');
      }
    }

    return user_id;
  }

  @Post(':session_id')
  @ResponseMesssage("성공적으로 질의 요청이 처리되었습니다.")
  async create(@Param('session_id') session_id: string, @Body() createChatDto: CreateChatDto, @Req() req: Request) {
    const user_id = await this.getUserId(req);
    console.log('user_id:', user_id);

    const result = await this.chatService.create(user_id, session_id, createChatDto);
    
    // 특정 조건일 때 SSE로 이벤트 전송
    if (result.chat_type === 'general') {
      // 스트리밍 방식으로 전송 (10자씩 나누어서)
      await this.sendStreamingChatEventToUser(user_id, result, 10);
    }
    
    return result;
  }

  // @Get()
  // findAll() {
  //   return this.chatService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.chatService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
  //   return this.chatService.update(+id, updateChatDto);
  // }

  @Delete(':session_id')
  @ResponseMesssage("성공적으로 질의 요청이 취소되었습니다.")
  async remove(@Param('session_id') session_id: string, @Req() req: Request) {
    const user_id = await this.getUserId(req);
    console.log('user_id:', user_id);

    const result = await this.chatService.remove(user_id, session_id);
    return result;
  }
}
