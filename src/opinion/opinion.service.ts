import { Injectable } from '@nestjs/common';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';
import { PrismaService } from 'src/prisma.service';
import { Opinion } from '@prisma/client';

@Injectable()
export class OpinionService {
  constructor(private prismaService: PrismaService) {}

  async create(createOpinionDto: CreateOpinionDto, user_id: string, doctor_id?: number): Promise<Opinion> {
    const data = {
      user_id,
      doctor_id,
      opinion_type: createOpinionDto.opinion_type,
      title: createOpinionDto.title,
      content: createOpinionDto.content,
      memo: createOpinionDto.memo,
    };

    return await this.prismaService.opinion.create({
      data
    });
  }

  // findAll() {
  //   return `This action returns all opinion`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} opinion`;
  // }

  // update(id: number, updateOpinionDto: UpdateOpinionDto) {
  //   return `This action updates a #${id} opinion`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} opinion`;
  // }
}
