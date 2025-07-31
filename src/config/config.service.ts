import { Injectable } from '@nestjs/common';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class ConfigService {
  // create(createConfigDto: CreateConfigDto) {
  //   return 'This action adds a new config';
  // }

  getConfig() {
    return {
      user_max_token: process.env.USER_MAX_TOKEN,
      user_retry_limit_sec: process.env.USER_RETRY_LIMIT_SEC,
      guest_max_token: process.env.GUEST_MAX_TOKEN,
      guest_retry_limit_sec: process.env.GUEST_RETRY_LIMIT_SEC,
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} config`;
  // }

  // update(id: number, updateConfigDto: UpdateConfigDto) {
  //   return `This action updates a #${id} config`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} config`;
  // }
}
