import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ResponseMesssage } from 'src/common/decorators/response-message-decorator';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

@Controller('new_session')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService
  ) {}

  @Post()
  @ResponseMesssage("성공적으로 새 세션이 생성 되었습니다.")
  async create(@Body() createSessionDto: CreateSessionDto, @Req() req: Request) {
    
    const authHeader = req.headers['authorization'];
    let user_id: string = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        });
        user_id = payload.user_id;
      } catch (e) {
        console.log(e);
        // throw new UnauthorizedException('Invalid access token');
        throw new UnauthorizedException(e.message);
      }
    }

    console.log('user_id:', user_id);

    const session_id = await this.sessionService.create(user_id, createSessionDto);

    const sec_of_7day = 1000 * 60 * 60 * 24 * 7;
    if (!user_id) {
      const guest_id = `guest_${uuidv4()}`;
      return {
        data: session_id,
        setCookie: {
          name: 'guest_id',
          value: guest_id,
          options: {
            httpOnly: true,
            path: '/',
            secure: false, // process.env.NODE_ENV === 'production',
            maxAge: sec_of_7day,
          },
        },
      };
    }
    return session_id;
  }

  // @Get()
  // findAll() {
  //   return this.sessionService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.sessionService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
  //   return this.sessionService.update(+id, updateSessionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.sessionService.remove(+id);
  // }
}
