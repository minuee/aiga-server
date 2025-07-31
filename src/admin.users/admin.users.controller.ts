import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AdminUsersService } from './admin.users.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { ResponseMesssage } from 'src/common/decorators/response-message-decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  
  @Post()
  @ApiOperation({ 
    summary: '유저 생성', 
    description: 'Oauth인증을 통해 생성되어야 하기 때문에, 임의 생성을 제한 함.',
    deprecated: true,
  })
  @ResponseMesssage("성공적으로 해당 유저가 추가 되었습니다.")
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.usersService.create(createUserDto);
    return {
      user: result
    }
  }

  
  @Get()
  @ResponseMesssage("성공적으로 해당 유저를 모두 가져왔습니다.")
  async findAll() {
    const result = await this.usersService.findAll();
    return {
      users: result
    }
  }

  
  @Get(':user_id')
  @ResponseMesssage("성공적으로 해당 유저를 가져왔습니다.")
  async findOne(@Param('user_id') user_id: string) {
    const foundUser = await this.usersService.findOne(user_id);

    if (!foundUser) {
      // throw new NotFoundException('존재하지 않는 유저입니다.');
      throw new HttpException('존재하지 않는 유저입니다.', HttpStatus.NOT_FOUND);
    }

    return {
      user: foundUser
    }
  }

  
  @Patch(':user_id')
  @ResponseMesssage("성공적으로 해당 유저를 수정했습니다.")
  async update(
    @Param('user_id') user_id: string, 
    @Body() updateUserDto: UpdateUserDto) 
  {
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

  
  @Delete(':user_id')  
  @ResponseMesssage("성공적으로 해당 유저를 삭제했습니다.")
  async remove(@Param('user_id') user_id: string) {

    const foundUser = await this.usersService.findOne(user_id);

    if (!foundUser) {
      // throw new NotFoundException('존재하지 않는 유저입니다.');
      throw new HttpException('존재하지 않는 유저입니다.', HttpStatus.NOT_FOUND);
    }

    const result = await this.usersService.remove(user_id);
    return {
      user: result
    }
  }
}
