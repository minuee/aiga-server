import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdminNoticeService } from './admin.notice.service';
import { ResponseMesssage } from 'src/common/decorators/response-message-decorator';
import { AdminGuard } from 'src/common/guards/admin.guard';

import { CreateNoticeDto } from 'src/notice/dto/create-notice.dto';
import { UpdateNoticeDto } from 'src/notice/dto/update-notice.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
// @UseGuards(AdminGuard)
@Controller('admin/notice')
export class AdminNoticeController {
  constructor(private readonly noticeService: AdminNoticeService) {}

  @Post()
  @ResponseMesssage("성공적으로 공지사항을 작성했습니다.")
  async create(@Body() createNoticeDto: CreateNoticeDto) {
    const result = await this.noticeService.create(createNoticeDto);
    return {
      notice: result
    }
  }

  @Get()
  @ResponseMesssage("성공적으로 모든 공지사항을 조회했습니다.")
  async findAll() {
    const result = await this.noticeService.findAll();
    return {
      notices: result
    }
  }

  @Get(':notice_id')
  @ResponseMesssage("성공적으로 공지사항을 조회했습니다.")
  async findOne(@Param('notice_id', ParseIntPipe) notice_id: number) {
    
    const foundNotice = await this.noticeService.findOne(notice_id);
    if (!foundNotice) {
      throw new HttpException('존재하지 않는 공지사항입니다.', HttpStatus.NOT_FOUND);
    }

    const result = await this.noticeService.findOne(notice_id);
    return {
      notice: result
    }
  }

  @Patch(':notice_id')
  @ResponseMesssage("성공적으로 공지사항을 수정했습니다.")
  async update(@Param('notice_id', ParseIntPipe) notice_id: number, @Body() updateNoticeDto: UpdateNoticeDto) {
    
    const foundNotice = await this.noticeService.findOne(notice_id);
    if (!foundNotice) {
      throw new HttpException('존재하지 않는 공지사항입니다.', HttpStatus.NOT_FOUND);
    }

    const result = await this.noticeService.update(notice_id, updateNoticeDto);
    return {
      notice: result
    }
  }

  @Delete(':notice_id')
  @ResponseMesssage("성공적으로 공지사항을 삭제했습니다.")
  async remove(@Param('notice_id', ParseIntPipe) notice_id: number) {
    
    const foundNotice = await this.noticeService.findOne(notice_id);
    if (!foundNotice) {
      throw new HttpException('존재하지 않는 공지사항입니다.', HttpStatus.NOT_FOUND);
    }

    const result = await this.noticeService.remove(notice_id);
    return {
      notice: result
    }
  }
}
