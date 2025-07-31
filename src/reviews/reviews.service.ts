import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma.service';
import { Review } from '@prisma/client';

@Injectable()
export class ReviewsService {

  constructor(private prismaService: PrismaService) {}
  
  async create(createReviewDto: CreateReviewDto, user_id: string): Promise<Review> {

    const user = await this.prismaService.user.findUnique({
      where: {
        user_id: user_id,
      },
    });

    const nickname = user?.nickname;

    return await this.prismaService.review.create({
      data: {
        user_id: user_id,
        nickname: nickname,
        doctor_id: createReviewDto.doctor_id,
        content: createReviewDto.content,
        total_score: createReviewDto.total_score,
        kindness_score: createReviewDto.kindness_score,
        explaination_score: createReviewDto.explaination_score,
        satisfaction_score: createReviewDto.satisfaction_score,
        recommand_score: createReviewDto.recommand_score,
      },
    });
  }

  async findAll(doctor_id: number) : Promise<Review[]> {

    const reviews = await this.prismaService.review.findMany({
      where: {
        doctor_id,
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

    return processedReviews;
  }

  async findOne(review_id: number) : Promise<Review | null> {
    const review = await this.prismaService.review.findUnique({
      where: {
        review_id,
      },
      include: {
        user: {
          select: {
            nickname: true,
            unregist_date: true
          }
        }
      },
    });

    if (!review) {
      return null;
    }

    const { user, ...reviewWithoutUser } = review;
    // user.nickname이 존재하면 review.nickname을 덮어쓰기
    if (user) {
      reviewWithoutUser.nickname = user.unregist_date ? '비회원' : user.nickname;
    }

    return reviewWithoutUser;
  }

  async update(review_id: number, updateReviewDto: UpdateReviewDto) : Promise<Review | null> {
    const data = {
      doctor_id: updateReviewDto.doctor_id,
      content: updateReviewDto.content,
      total_score: updateReviewDto.total_score,
      kindness_score: updateReviewDto.kindness_score,
      explaination_score: updateReviewDto.explaination_score,
      satisfaction_score: updateReviewDto.satisfaction_score,
      recommand_score: updateReviewDto.recommand_score,
    };
    console.log('data:', data);

    return this.prismaService.review.update({
      where: {
        review_id,
      },
      data
    });
  }

  async remove(review_id: number) : Promise<Review> {
    return this.prismaService.review.delete({
      where: {
        review_id,
      },
    });
  }
}
