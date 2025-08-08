import { Injectable } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';

@Injectable()
export class DoctorsService {

  constructor(private prismaService: PrismaService) {}
  
  // create(createDoctorDto: CreateDoctorDto) {
  //   return 'This action adds a new doctor';
  // }

  // findAll() {
  //   return `This action returns all doctors`;
  // }

  async findOne(doctor_id: number, createDoctorDto: CreateDoctorDto) {
    const session_id = createDoctorDto.session_id;

    const chat_url = `http://${process.env.LLM_SERVER_HOST}:${process.env.LLM_SERVER_PORT}/chat/doctor`;

    // llm-server로 질의 요청
    const res = await axios.post(chat_url, {
      session_id: session_id,
      message: `doctor_id: ${doctor_id}`
    });

    // 응답에 review 추가
    let doctor = res.data.doctors?.[0];
    if(!doctor) {
      return null;
    }
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
    
    return doctor;
  }

  // async update(doctor_id: number, user_id: string, updateDoctorDto: UpdateDoctorDto) {
  //   const data = {
  //     user_id,
  //     opinion_type: updateDoctorDto.opinion_type || 1,
  //     title: updateDoctorDto.title,
  //     content: updateDoctorDto.content,
  //   };


  //   return await this.prismaService.opinion.create({
  //     data
  //   });
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} doctor`;
  // }
}
