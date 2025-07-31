import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform-interceptor';
import { ResponseMesssage } from './common/decorators/response-message-decorator';

// @UseInterceptors(ResponseTransformInterceptor)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // @ResponseMesssage("성공입니다.")
  getHello() {
    const value =  this.appService.getHello();
    
    // return value;

    return {
      data: value,
      message: "성공입니다."
    }
  }
}
