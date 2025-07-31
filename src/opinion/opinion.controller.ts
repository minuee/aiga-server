import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { OpinionService } from './opinion.service';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';
import { ResponseMesssage } from 'src/common/decorators/response-message-decorator';
import { Utils } from 'src/common/utils/utils';
import { Request } from 'express';
import { UserGuard } from 'src/common/guards/user.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('opinion')
export class OpinionController {
  constructor(private readonly opinionService: OpinionService) {}

  @UseGuards(UserGuard)
  @Post()
  @ResponseMesssage("성공적으로 의견을 등록했습니다.")
  async create(@Body() createOpinionDto: CreateOpinionDto, @Req() req: Request) {
    // const user_id = Utils.checkAuthorization(req);
    const user_id = req.user_id ?? "";
    
    createOpinionDto.opinion_type = 0;
    const result = await this.opinionService.create(createOpinionDto, user_id);
    return {
      opinion: result
    }
  }

  @UseGuards(UserGuard)
  @Post('doctor/:doctor_id')
  @ResponseMesssage("성공적으로 의사정보 수정요청을 등록했습니다.")
  async createForDoctor(@Param('doctor_id', ParseIntPipe) doctor_id: number, @Body() createOpinionDto: CreateOpinionDto, @Req() req: Request) {
    // const user_id = Utils.checkAuthorization(req);
    const user_id = req.user_id ?? "";

    createOpinionDto.opinion_type = 1;
    const result = await this.opinionService.create(createOpinionDto, user_id, doctor_id);
    return {
      opinion: result
    }
  }

  // @Get()
  // findAll() {
  //   return this.opinionService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.opinionService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOpinionDto: UpdateOpinionDto) {
  //   return this.opinionService.update(+id, updateOpinionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.opinionService.remove(+id);
  // }
}
