import { Injectable } from '@nestjs/common';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { PrismaService } from 'src/prisma.service';
import { Notice } from '@prisma/client';

@Injectable()
export class NoticeService {

  constructor(private prismaService: PrismaService) {}

  async create(createNoticeDto: CreateNoticeDto) {
    return await this.prismaService.notice.create({
      data: createNoticeDto,
    });
  }

  async findAll() : Promise<Notice[]> {
    return this.prismaService.notice.findMany();
  }

  async findOne(notice_id: number) : Promise<Notice | null> {
    return this.prismaService.notice.findUnique({
      where: {
        notice_id,
      },
    });
  }

  update(notice_id: number, updateNoticeDto: UpdateNoticeDto) {
    return this.prismaService.notice.update({
      where: {
        notice_id,
      },
      data: updateNoticeDto,
    });
  }

  async remove(notice_id: number): Promise<Notice> {
    return this.prismaService.notice.delete({
      where: {
        notice_id,
      },
    });
  }
}
