import { Module } from '@nestjs/common';
import { AdminOpinionService } from './admin.opinion.service';
import { AdminOpinionController } from './admin.opinion.controller';

@Module({
  controllers: [AdminOpinionController],
  providers: [AdminOpinionService],
})
export class AdminOpinionModule {}
