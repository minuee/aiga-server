import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';
import { RedisService } from 'src/common/utils/redis.service';

const USER_MAX_TOKEN = parseInt(process.env.USER_MAX_TOKEN ?? '100000');
const GUEST_MAX_TOKEN = parseInt(process.env.GUEST_MAX_TOKEN ?? '100000');

@Injectable()
export class ChatService {

  constructor(private prismaService: PrismaService, private redisService: RedisService) {}

  async create(user_id: string, session_id: string, createChatDto: CreateChatDto) {
    
    const remainingHours = 16;

    if(user_id && user_id.startsWith('uid_')) {
      const result: { restricted_time: number }[] = await this.prismaService.$queryRaw`
      SELECT 
        restricted_time
      FROM tb_user 
      WHERE user_id = ${user_id}
      `;

      const restricted_time = parseInt(result[0]?.restricted_time?.toString() ?? '0');

      if(Date.now() < restricted_time) {
        throw new ForbiddenException(`{
          message: '토큰 초과로 인한 이용 제한',
          restrictionHours: ${remainingHours},
          remainingTime: ${Math.ceil((restricted_time - Date.now()) / 1000)},
          timestamp: ${Date.now()}
        }`);
      }

    }
    else { // 비회원
      // 제한 여부 먼저 확인
      const restriction = await this.redisService.isGuestRestricted(user_id);
      if (restriction.restricted) {
        // const remainingHours = Math.ceil(restriction.remainingTime! / 3600);
        
        throw new ForbiddenException(`{
          message: '토큰 초과로 인한 이용 제한',
          restrictionHours: ${remainingHours},
          remainingTime: ${restriction.remainingTime},
          timestamp: ${Date.now()}
        }`);
      }
    }

    const question = createChatDto.question;
    
    const chat_url = `http://${process.env.LLM_SERVER_HOST}:${process.env.LLM_SERVER_PORT}/chat/start`;

    // llm-server로 질의 요청
    const res = await axios.post(chat_url, {
      session_id: session_id,
      message: question
    });

    let chat_id;
    const chat_type = res.data.chat_type;
    const summary = res.data?.summary ?? '';
    const used_token = parseInt(res.data.total_tokens);
    let in24_used_token = 0;

    // 응답에 review 추가
    let answer = res.data.answer;
    if( chat_type == 'recommand_doctor' || chat_type == 'search_doctor' ) {
      for(const doctor of answer.doctors) {
        const doctor_id = doctor.doctor_id;
        try{
          const reviews = await this.prismaService.review.findMany({
            where: {
              doctor_id: doctor_id
            },
            include: {
              user: {
                select: {
                  nickname: true,
                  unregist_date: true
                }
              }
            },
            orderBy: {
              createAt: 'desc'
            }
          });

          // review 데이터 처리: 
          // 1. user.unregist_date가 있으면 nickname을 '비회원'으로 덮어쓰기
          // 2. user.nickname이 있으면 nickname을 덮어쓰고
          const processedReviews = reviews.map(review => {
            const { user, ...reviewWithoutUser } = review;
            if (user) {
              reviewWithoutUser.nickname = user.unregist_date ? '비회원' : user.nickname;
            }         
            return reviewWithoutUser;
          });

          doctor.review = processedReviews;
        }catch(e:any) {
          console.log("eee",e)
          doctor.review = [];
        }
      }
    }
    
    // user_id 존재하고 uid_ 시작하면 회원
    // (처음)세션 제목, 채팅 저장
    if(user_id && user_id.startsWith('uid_')) {

      // 세션 존재 여부 파악
      const session = await this.prismaService.session.findUnique({
        where: {
          session_id: session_id
        }
      });

      // 세션없으면 무언가 에러 
      if(!session) {
        throw new NotFoundException('세션이 존재하지 않습니다.');
      }

      // 24시간 동안 사용된 토큰 수 조회 쿼리 수정 2025.08.01 By Noh.SN
      const result_old: { total_tokens: number }[] = await this.prismaService.$queryRaw`
        SELECT 
          IFNULL(SUM(IFNULL(used_token, 0)), 0) as total_tokens
        FROM tb_chatting 
        WHERE user_id = ${user_id}
        AND question_time >= UTC_TIMESTAMP() - INTERVAL 24 HOUR
      `;

      const result: { total_tokens: number }[] = await this.prismaService.$queryRaw`
        SELECT COALESCE(SUM(t.used_token), 0) as total_tokens
        FROM (
            SELECT used_token
            FROM tb_chatting
            WHERE user_id = ${user_id} AND question_time >= UTC_TIMESTAMP() - INTERVAL 24 HOUR
        ) AS t;
      `;

      // 24시간 동안 누적된 토큰 수
      // in24_used_token = result[0]?.total_tokens ?? 0;
      in24_used_token = parseInt(result[0]?.total_tokens?.toString() ?? '0');

      in24_used_token += used_token;
      // 최대 토큰 초과 여부 파악
      if(in24_used_token > USER_MAX_TOKEN) {

        // 지금부터 16시간 동안 제한(millisec)
        const restricted_time = Date.now() + (16 * 60 * 60 * 1000);

        const temp = await this.prismaService.$queryRaw`
        UPDATE tb_user SET
          restricted_time = ${restricted_time}
        WHERE user_id = ${user_id}
        `;

        // 최대 토큰 초과시 에러없이 16시간 제한 설정
        // throw new ForbiddenException(`{
        //   message: '최대 토큰수 초과 에러',
        //   maxToken: ${USER_MAX_TOKEN},
        //   in24_used_token: ${in24_used_token},
        //   usedToken: ${used_token},
        //   timestamp: ${Date.now()}
        // }`);
      }

      // 세션 제목이 없으면 == 최초 질의로 
      if(session.title == null) {
        // 세션 제목 설정
        await this.prismaService.session.update({
          where: { session_id: session_id },
          data: {  title: question }
        });
      }

      // 대화 저장
      const chat = await this.prismaService.chatting.create({
        data: {
          session_id: session_id,
          user_id: user_id,
          chat_type: chat_type,
          question: question,
          summary: summary,
          answer: JSON.stringify(answer),
          used_token: used_token,
        },
      });
      chat_id = chat.chat_id;

      // 무조건 세션 업데이트일자를 수정해준다 맨앞으로 오게
      await this.prismaService.session.update({
        where: { session_id: session_id },
        data: {  updateAt: new Date() }
      });

    }
    else { // 비회원
      const guest_id = user_id;
      const TTL_SEC = 84000;  // 24시간 == 1일
           
      // 현재 24시간 내 사용된 토큰 총합 조회
      const current_total = await this.redisService.getGuestTokenTotal(guest_id);
      const after_total = current_total + used_token;
      
      // 24시간 내 최대 토큰 초과 체크
      if (after_total > GUEST_MAX_TOKEN) {
        // 제한 설정 (16시간)
        await this.redisService.setGuestRestriction(guest_id, 16);
        
        // 최대 토큰 초과시 에러없이 16시간 제한 설정
        // throw new ForbiddenException(`{
        //   message: '비회원 최대 토큰 초과 에러, 16시간 동안 이용 제한',
        //   maxToken: ${GUEST_MAX_TOKEN},
        //   in24_used_token: ${after_total},
        //   usedToken: ${used_token},
        //   timestamp: ${Date.now()}
        // }`);
      }
      
      // 개별 토큰 저장 (24시간 TTL 적용)
      await this.redisService.addGuestToken(guest_id, used_token, TTL_SEC);
      in24_used_token = after_total;
      
      console.log(`guest_id: ${guest_id}, used_token: ${used_token}, in24_used_token: ${after_total}`);
    }

    return {
      session_id, 
      chat_id,
      chat_type,
      question,
      summary,
      answer,
      used_token,
      in24_used_token
    }
  }

  // findAll() {
  //   return `This action returns all chat`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} chat`;
  // }

  // update(id: number, updateChatDto: UpdateChatDto) {
  //   return `This action updates a #${id} chat`;
  // }

  async remove(user_id: string, session_id: string) {
    
    // todo: llm에게 요청 취소
    // const llm_response = await this.llmService.revoke(user_id, session_id);

    // user_id 존재하고 "uid_" 이면 회원이며,
    // // 세션 제거
    // if(user_id && user_id.startsWith('uid_')) {
    //   await this.prismaService.session.delete({
    //     where: {
    //       session_id: session_id
    //     }
    //   });
    // }
    
    return {
      session_id: session_id
    };
  }

}
