import { Module } from '@nestjs/common';
import { OpinionService } from './opinion.service';
import { OpinionController } from './opinion.controller';

@Module({
  controllers: [OpinionController],
  providers: [OpinionService],
})
export class OpinionModule {}
