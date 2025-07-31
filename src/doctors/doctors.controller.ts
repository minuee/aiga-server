import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { ResponseMesssage } from 'src/common/decorators/response-message-decorator';
import { Utils } from 'src/common/utils/utils';
import { Request, Response } from 'express';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  // @Post()
  // create(@Body() createDoctorDto: CreateDoctorDto) {
  //   return this.doctorsService.create(createDoctorDto);
  // }

  // @Get()
  // findAll() {
  //   return this.doctorsService.findAll();
  // }

  @Post(':doctor_id')
  @ResponseMesssage("성공적으로 해당 doctor를 조회했습니다.")
  async findOne(@Param('doctor_id', ParseIntPipe) doctor_id: number, @Body() createDoctorDto: CreateDoctorDto) {
    const result = await this.doctorsService.findOne(doctor_id, createDoctorDto);
    if(!result) {
      throw new NotFoundException('해당 의사를 찾을 수 없습니다.');
    }
    return {
      doctor: result
    }
  }

  // @Patch(':doctor_id')
  // @ResponseMesssage("성공적으로 해당 doctor에 대해 수정 요청했습니다.")
  // update(@Param('doctor_id') doctor_id: string, @Body() updateDoctorDto: UpdateDoctorDto, @Req() req: Request) {
  //   const user_id = Utils.checkAuthorization(req);
  //   return this.doctorsService.update(+doctor_id, user_id, updateDoctorDto);
  // }

  // @Delete(':doctor_id')
  // remove(@Param('doctor_id') doctor_id: string) {
  //   return this.doctorsService.remove(+doctor_id);
  // }
}
