import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { ResponseMesssage } from 'src/common/decorators/response-message-decorator';
import { Request } from 'express';
import { Utils } from 'src/common/utils/utils';
import { UserGuard } from 'src/common/guards/user.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(UserGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  // @Post()
  // create(@Body() createHistoryDto: CreateHistoryDto) {
  //   return this.historyService.create(createHistoryDto);
  // }

  // checkAuthorization(@Req() req: Request) {
  //   const user_id = req.user_id ?? "";
  //   if (!user_id) {
  //     throw new UnauthorizedException('인증된 회원이 아닙니다.');
  //   }
  //   return user_id;
  // }

  @Get()
  @ResponseMesssage("성공적으로 대화 이력이 조회되었습니다.")
  async findAll(@Req() req: Request) {
    const user_id = req.user_id ?? "";
    const result = await this.historyService.findAll(user_id);
    return {
      history: result
    }

  }

  @Get(':session_id')
  findOne(@Param('session_id') session_id: string) {
    return this.historyService.findOne(session_id);
  }

  @Patch(':session_id')
  @ResponseMesssage("성공적으로 세션 제목이 수정되었습니다.")
  async update(@Param('session_id') session_id: string, @Body() updateHistoryDto: UpdateHistoryDto, @Req() req: Request) {
    const result = await this.historyService.update(session_id, updateHistoryDto);
    return {
      history: result
    }
  }

  @Delete(':session_id')
  @ResponseMesssage("성공적으로 대화 이력이 삭제되었습니다.")
  async remove(@Param('session_id') session_id: string, @Req() req: Request) {
    
    // const user_id = Utils.checkAuthorization(req);
    const user_id = req.user_id ?? "";

    const result = await this.historyService.remove(session_id, user_id);
    return {
      history: result
    }
  }
}
