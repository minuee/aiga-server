import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, NotFoundException, UseGuards, Query } from '@nestjs/common';
import { AdminOpinionService } from './admin.opinion.service';
import { CreateAdminOpinionDto } from './dto/create-admin.opinion.dto';
import { UpdateAdminOpinionDto } from './dto/update-admin.opinion.dto';
import { ResponseMesssage } from 'src/common/decorators/response-message-decorator';
import { CreateOpinionDto } from 'src/opinion/dto/create-opinion.dto';
import { UpdateOpinionDto } from 'src/opinion/dto/update-opinion.dto';
import { GuardPass } from 'src/common/decorators/guardpass.decorator';
import { AdminGuard } from 'src/common/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('admin/opinion')
export class AdminOpinionController {
  constructor(private readonly adminOpinionService: AdminOpinionService) {}

  async findOpinion(opinion_id: number) {
    const found = await this.adminOpinionService.findOne(opinion_id);
    if (!found) {
      throw new NotFoundException(`존재하지 않는 opinion_id(${opinion_id})입니다.`);
    }
    return found;
  }

  // @Post()
  // @ResponseMesssage("성공적으로 의견을 등록했습니다.")
  // create(@Body() createOpinionDto: CreateOpinionDto) {
  //   return this.adminOpinionService.create(createOpinionDto);
  // }

  // @GuardPass()
  @Get()
  @ResponseMesssage("성공적으로 모든 의견을 조회했습니다.")
  findAll(@Query('page', ParseIntPipe) page: number, @Query('size', ParseIntPipe) size: number) {
    page = page < 1 ? 1 : page;
    size = size < 1 ? 10 : size;
    return this.adminOpinionService.findAll(page, size);
  }

  @Get(':opinion_id')
  @ResponseMesssage("성공적으로 의견을 조회했습니다.")
  async findOne(@Param('opinion_id', ParseIntPipe) opinion_id: number) {
    const found = await this.findOpinion(opinion_id);
    return found;
  }

  @Patch(':opinion_id')
  @ResponseMesssage("성공적으로 의견을 수정했습니다.")
  async update(@Param('opinion_id', ParseIntPipe) opinion_id: number, @Body() updateOpinionDto: UpdateOpinionDto) {
    await this.findOpinion(opinion_id);
    return this.adminOpinionService.update(+opinion_id, updateOpinionDto);
  }

  @Delete(':opinion_id')
  @ResponseMesssage("성공적으로 의견을 삭제했습니다.")
  async remove(@Param('opinion_id', ParseIntPipe) opinion_id: number) {
    await this.findOpinion(opinion_id);
    return this.adminOpinionService.remove(+opinion_id);
  }
}
