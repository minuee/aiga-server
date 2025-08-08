import { Injectable } from '@nestjs/common';
import { CreateAdminOpinionDto } from './dto/create-admin.opinion.dto';
import { UpdateAdminOpinionDto } from './dto/update-admin.opinion.dto';
import { PrismaService } from 'src/prisma.service';
import { Opinion } from '@prisma/client';
import { CreateOpinionDto } from 'src/opinion/dto/create-opinion.dto';
import { UpdateOpinionDto } from 'src/opinion/dto/update-opinion.dto';

@Injectable()
export class AdminOpinionService {

  constructor(private prismaService: PrismaService) {}
  
  // create(createAdminOpinionDto: CreateAdminOpinionDto) {
  //   return 'This action adds a new adminOpinion';
  // }

  async findAll(page: number, size: number) : Promise<Opinion[]> {
    return this.prismaService.opinion.findMany({
      skip: (page - 1) * size,
      take: size,
    });
  }

  async findOne(opinion_id: number) : Promise<Opinion | null> {
    return this.prismaService.opinion.findUnique({
      where: {
        opinion_id,
      },
    });
  }

  async update(opinion_id: number, updateOpinionDto: UpdateOpinionDto) {
    return this.prismaService.opinion.update({
      where: {
        opinion_id,
      },
      data: updateOpinionDto
    });
  }

  async remove(opinion_id: number) {
    return this.prismaService.opinion.delete({
      where: {
        opinion_id,
      },
    });
  }
}
