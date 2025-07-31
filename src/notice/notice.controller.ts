import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { ResponseMesssage } from 'src/common/decorators/response-message-decorator';
import { AdminGuard } from 'src/common/guards/admin.guard';

@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  // @UseGuards(AdminGuard)
  // @Post()
  // @ResponseMesssage("성공적으로 공지사항을 작성했습니다.")
  // create(@Body() createNoticeDto: CreateNoticeDto) {
  //   return this.noticeService.create(createNoticeDto);
  // }

  @Get()
  @ResponseMesssage("성공적으로 모든 공지사항을 조회했습니다.")
  async findAll() {
    const result = await this.noticeService.findAll();
    return {
      notice: result
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

  // @UseGuards(AdminGuard)
  // @Patch(':notice_id')
  // @ResponseMesssage("성공적으로 공지사항을 수정했습니다.")
  // async update(@Param('notice_id', ParseIntPipe) notice_id: number, @Body() updateNoticeDto: UpdateNoticeDto) {
    
  //   const foundNotice = await this.noticeService.findOne(notice_id);
  //   if (!foundNotice) {
  //     throw new HttpException('존재하지 않는 공지사항입니다.', HttpStatus.NOT_FOUND);
  //   }

  //   return this.noticeService.update(notice_id, updateNoticeDto);
  // }
  
  // @UseGuards(AdminGuard)
  // @Delete(':notice_id')
  // @ResponseMesssage("성공적으로 공지사항을 삭제했습니다.")
  // async remove(@Param('notice_id', ParseIntPipe) notice_id: number) {
    
  //   const foundNotice = await this.noticeService.findOne(notice_id);
  //   if (!foundNotice) {
  //     throw new HttpException('존재하지 않는 공지사항입니다.', HttpStatus.NOT_FOUND);
  //   }

  //   return this.noticeService.remove(notice_id);
  // }
}
