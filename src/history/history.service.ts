import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { PrismaService } from 'src/prisma.service';
import { Chatting, Session } from '@prisma/client';

@Injectable()
export class HistoryService {

  constructor(private prismaService: PrismaService) {}
  
  // create(createHistoryDto: CreateHistoryDto) {
  //   return 'This action adds a new history';
  // }

  async findAll(user_id: string) {

    type SessionType = {
      user_id: string;
      session_id: string;
      session_time: Date | null;
      updateAt: Date | null;
      title: string | null;
      chattings: Chatting[];
    };

    const result: { user_id: string, sessions: SessionType[] } = {
      user_id,
      sessions: []
    }
    // return `This action returns all history`;
    const sessions: Session[] = await this.prismaService.session.findMany({
      where: {
        user_id,
        title: {
          not: null
        }
      },
      orderBy: [
        { updateAt: 'desc' },
        { session_time: 'desc' }
      ]
    });

    for (const session of sessions) {
      const session_id: string = session.session_id;
      const title: string | null = session.title;
      const session_time: Date | null = session.session_time;
      const updateAt: Date | null = session.updateAt;

      let chattings: Chatting[] = [];
      /* 
      // 대화 이력이 있는 경우만 추가 불필요한 처리로 제거 2025.07.30 By Noh.SN
      chattings = await this.prismaService.chatting.findMany({
        where: {
          session_id: session_id,
        },
      }); */

      // 대화 이력이 있는 경우만 추가 불필요한 처리로 제거 2025.07.30 By Noh.SN
      //if(chattings.length > 0) {
        result.sessions.push({
          user_id,
          session_id,
          title,
          session_time,
          updateAt,
          chattings
        });
      //}

    }

    return result;
  }

  async findOne(session_id: string) {
    const chattings: Chatting[] = await this.prismaService.chatting.findMany({
      where: {
        session_id: session_id,
      },
    });

    if(chattings.length > 0) {
      return chattings;
    }else{
      return [];
    }
    //return `This action returns a #${session_id} history`;
  }

  async update(session_id: string, updateHistoryDto: UpdateHistoryDto) {
    
    const session = await this.prismaService.session.findUnique({
      where: {
        session_id
      }
    });

    if(!session) {
      throw new NotFoundException('세션이 존재하지 않습니다.');
    }

    const data = {
      title: updateHistoryDto.title,
      updateAt: new Date()
    };

    return this.prismaService.session.update({
      where: {
        session_id,
      },
      data
    });
  }

  async remove(session_id: string, user_id: string) {

    // 세션 존재 여부 확인
    const session = await this.prismaService.session.findUnique({
      where: {
        session_id
      }
    });

    if(!session) {
      throw new NotFoundException('세션이 존재하지 않습니다.');
    }

    // 대화 이력 삭제
    await this.prismaService.chatting.deleteMany({
      where: {
        session_id, 
        user_id,
      }
    });

    // 세션 삭제
    return this.prismaService.session.delete({
      where: {
        session_id
      }
    });
  }
}
