import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { SessionModule } from './session/session.module';
import { AuthModule } from './auth/auth.module';
import { HistoryModule } from './history/history.module';
import { ReviewsModule } from './reviews/reviews.module';
import { OpinionModule } from './opinion/opinion.module';
import { ConfigModule } from './config/config.module';
import { NoticeModule } from './notice/notice.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AdminModule } from './admin/admin.module';
import { CommonModule } from './common/common.module';
import { AdminNoticeModule } from './admin.notice/admin.notice.module';
import { AdminUsersModule } from './admin.users/admin.users.module';
import { AdminOpinionModule } from './admin.opinion/admin.opinion.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule, 
    SessionModule, 
    ChatModule, 
    AuthModule, 
    UsersModule, 
    HistoryModule, 
    ReviewsModule, 
    OpinionModule,    
    NoticeModule, 
    DoctorsModule, 
    AdminNoticeModule,
    AdminOpinionModule,
    AdminUsersModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
