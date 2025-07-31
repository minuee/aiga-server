import { Module } from '@nestjs/common';
import { AdminNoticeService } from './admin.notice.service';
import { AdminNoticeController } from './admin.notice.controller';

@Module({
  controllers: [AdminNoticeController],
  providers: [AdminNoticeService],
})
export class AdminNoticeModule {}
