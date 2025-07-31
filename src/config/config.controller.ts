import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConfigService } from './config.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ResponseMesssage } from 'src/common/decorators/response-message-decorator';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  // @Post()
  // create(@Body() createConfigDto: CreateConfigDto) {
  //   return this.configService.create(createConfigDto);
  // }

  @Get()
  @ResponseMesssage("성공적으로 환경정보를 조회했습니다.")
  async getConfig() {
    const result = await this.configService.getConfig();
    return {
      config: result
    }
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.configService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateConfigDto: UpdateConfigDto) {
  //   return this.configService.update(+id, updateConfigDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.configService.remove(+id);
  // }
}
