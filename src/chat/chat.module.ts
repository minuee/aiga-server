import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { RedisService } from 'src/common/utils/redis.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, RedisService],
})
export class ChatModule {}
