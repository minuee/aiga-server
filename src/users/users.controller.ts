import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, ValidationPipe, NotFoundException, HttpException, HttpStatus, HttpCode, UseInterceptors, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoggingInterceptor } from '../common/interceptors/logging-interceptor';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform-interceptor';
import { ResponseMesssage } from '../common/decorators/response-message-decorator';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { ResponseDto } from '../common/decorators/response.dto';
import { GenericApiResponse } from '../common/decorators/generic-api-response-decorator';
import { Request, Response } from 'express';
import { UserGuard } from 'src/common/guards/user.guard';
import { GuardPass } from 'src/common/decorators/guardpass.decorator';

// @UseInterceptors(LoggingInterceptor)
// @UseInterceptors(ResponseTransformInterceptor)
@Controller('users')
// @ApiExtraModels(ResponseDto)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get('unregister')
  @ResponseMesssage("성공적으로 탈퇴 처리 되었습니다.")
  @GenericApiResponse({
    model: UserDto,
  })
  @ApiOperation({ 
    summary: '탈퇴 처리', 
    description: '탈퇴 처리 합니다.',
  })    
  async unregister(@Req() req: Request, @Res({ passthrough: true }) res: Response) {

    const user_id = req.user_id ?? '';

    console.log('user_id:', user_id);

    const foundUser = await this.usersService.findOne(user_id);

    if (!foundUser) {
      // throw new NotFoundException('존재하지 않는 유저입니다.');
      throw new HttpException('존재하지 않는 유저입니다.', HttpStatus.NOT_FOUND);
    }

    // logout 처리
    const refreshToken = req.cookies['refresh_token'];
    console.log('refreshToken', refreshToken);
    // 쿠키 삭제
    res.clearCookie('refresh_token', { path: '/' });

    const result = await this.usersService.remove(user_id);
    return {
      user: result
    }
  }

  @ApiBearerAuth()
  @UseGuards(UserGuard)
  // @GuardPass()
  @Patch('nickname')
  @ResponseMesssage("성공적으로 닉네임을 변경 했습니다.")
  @GenericApiResponse({
    model: UserDto,
  })
  @ApiOperation({ 
    summary: '유저 닉네임 변경', 
    description: '유저 닉네임을 변경합니다.',
  })    
  async changNickname(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {

    const user_id = req.user_id ?? '';

    console.log('user_id:', user_id);

    const foundUser = await this.usersService.findOne(user_id);

    if (!foundUser) {
      // throw new NotFoundException('존재하지 않는 유저입니다.');
      throw new HttpException('존재하지 않는 유저입니다.', HttpStatus.NOT_FOUND);
    }

    const result = await this.usersService.update(user_id, updateUserDto);
    return {
      user: result
    }
  }

  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get('agreement')
  @ResponseMesssage("성공적으로 약관 동의를 했습니다.")
  @GenericApiResponse({
    model: UserDto,
  })
  @ApiOperation({ 
    summary: '약관 동의', 
    description: '약관 동의 합니다.',
  })    
  async agreement(@Req() req: Request) {

    const user_id = req.user_id ?? '';

    console.log('user_id:', user_id);

    const result = await this.usersService.agreement(user_id);
    return {
      user: result
    }
  }
  
  /***********
  @UseGuards(AdminGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  @ResponseMesssage("성공적으로 해당 유저가 추가 되었습니다.")
  @GenericApiResponse({
    model: UserDto,
    status: 200,
    description: '성공적으로 해당 유저가 추가 되었습니다.',
  })
  @ApiOperation({ 
    summary: '유저 추가', 
    description: '유저를 추가합니다.',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.usersService.create(createUserDto);
    return createdUser;
  }


  @UseGuards(AdminGuard)
  @Get()
  @ApiBearerAuth()
  @ResponseMesssage("성공적으로 해당 유저를 모두 가져왔습니다.")
  // @ApiOkResponse({ 
  //   description: '성공적으로 해당 유저가 추가 되었습니다.',
  //   type: UserDto
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: '성공적으로 해당 유저를 모두 가져왔습니다.',
  //   schema: {
  //     allOf: [
  //       { $ref: getSchemaPath(ResponseDto) },
  //       {
  //         properties: {
  //           data: {
  //             type: 'array',
  //             items: { $ref: getSchemaPath(UserDto) },
  //           },
  //         },
  //       },
  //     ],
  //   },
  // })
  @GenericApiResponse({
    model: UserDto,
    status: 200,
    description: '성공적으로 해당 유저를 모두 가져왔습니다.',
    isArray: true,
  })
  // @ApiResponse({ status: 403, description: 'Forbidden.'})
  @ApiOperation({ 
    summary: '모든 유저 조회', 
    description: '모든 유저를 조회합니다.',
    // deprecated: false,
    // externalDocs: {
    //   url: 'https://aiga.com',
    //   description: 'AIGA 웹사이트',
    // },    
  })
  async findAll() {
    const fetchedUsers = await this.usersService.findAll();
    return fetchedUsers;
  }

  @UseGuards(AdminGuard)
  @Get(':user_id')
  @ResponseMesssage("성공적으로 해당 유저를 가져왔습니다.")
  @GenericApiResponse({
    model: UserDto,
    description: '성공적으로 해당 유저를 가져왔습니다.',
  })
  @ApiOperation({ 
    summary: '유저 조회', 
    description: '유저를 조회합니다.',
  })
  async findOne(@Param('user_id') user_id: string) {
    const foundUser = await this.usersService.findOne(user_id);

    if (!foundUser) {
      // throw new NotFoundException('존재하지 않는 유저입니다.');
      throw new HttpException('존재하지 않는 유저입니다.', HttpStatus.NOT_FOUND);
    }

    return foundUser;
  }

  @UseGuards(AdminGuard)
  @Patch(':user_id')
  @ResponseMesssage("성공적으로 해당 유저를 수정했습니다.")
  @GenericApiResponse({
    model: UserDto,
    description: '성공적으로 해당 유저를 수정했습니다.',
  })
  @ApiOperation({ 
    summary: '유저 갱신', 
    description: '유저를 갱신합니다.',
  })  
  async update(
    @Param('user_id') user_id: string, 
    @Body() updateUserDto: UpdateUserDto) 
  {
    const foundUser = await this.usersService.findOne(user_id);

    if (!foundUser) {
      // throw new NotFoundException('존재하지 않는 유저입니다.');
      throw new HttpException('존재하지 않는 유저입니다.', HttpStatus.NOT_FOUND);
    }

    const updatedUser = await this.usersService.update(user_id, updateUserDto);
    return updatedUser;
    
  }

  @UseGuards(AdminGuard)
  @Delete(':user_id')
  @ResponseMesssage("성공적으로 해당 유저를 삭제했습니다.")
  // @ApiResponse({ 
  //   status: -999,
  //   description: '',
  //   type: UserDto,
  // })
  @GenericApiResponse({
    model: UserDto,
  })
  @ApiOperation({ 
    summary: '유저 삭제', 
    description: '유저 삭제합니다.',
  })    
  async remove(@Param('user_id') user_id: string) {

    const foundUser = await this.usersService.findOne(user_id);

    if (!foundUser) {
      // throw new NotFoundException('존재하지 않는 유저입니다.');
      throw new HttpException('존재하지 않는 유저입니다.', HttpStatus.NOT_FOUND);
    }

    const deletedUser = await this.usersService.remove(user_id);
    return deletedUser;
  }
  *************/

}
