import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma.service';
import { Session } from '@prisma/client';

@Injectable()
export class SessionService {

  constructor(private prismaService: PrismaService) {}
  
  async create(user_id: string, createSessionDto: CreateSessionDto): Promise<object> {
    // uuid를 통해 session_id 생성
    const session_id = `sid_${uuidv4()}`;

    // 로그인(user_id) 회원이면 db에 저장
    if(user_id) {
      await this.prismaService.session.create({
        data: {
          session_id: session_id,
          user_id: user_id,
        },
      });
    }

    return await Promise.resolve({session_id});
  }

  // findAll() {
  //   return `This action returns all session`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} session`;
  // }

  // update(id: number, updateSessionDto: UpdateSessionDto) {
  //   return `This action updates a #${id} session`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} session`;
  // }
}
