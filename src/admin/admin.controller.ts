import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ResponseMesssage } from 'src/common/decorators/response-message-decorator';
import { AuthService } from 'src/auth/auth.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { GuardPass } from 'src/common/decorators/guardpass.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  makeRefreshCookie(refreshToken: string) {
    const refresh_token_expiration = parseInt(process.env.REFRESH_TOKEN_EXPIRATION || '7');
    // console.log('refresh_token_expiration:', refresh_token_expiration);
   
    const sec_of_day = 1000 * 60 * 60 * 24;
    const refresh_cookie = {
      name: 'refresh_token',
      value: refreshToken,
      options: {
        httpOnly: true,
        path: '/',
        secure: false, //   process.env.NODE_ENV === 'production',
        maxAge: sec_of_day * refresh_token_expiration,
      },
    }
    return refresh_cookie;
  }

  @GuardPass()
  @Post()
  @ResponseMesssage("성공적으로 관리자를 등록했습니다.")
  async create(@Body() createAdminDto: CreateAdminDto) {
    const admin = await this.adminService.create(createAdminDto);

    const payload = {
      user_id : admin.admin_id,
      // sns_type,
      // sns_id
      is_admin : true,
    };
    const tokens = await this.authService.generateTokens(payload);

    const refresh_cookie = this.makeRefreshCookie(tokens.refreshToken);
    console.log('refresh_cookie:', refresh_cookie);

    return {
      data: {
        admin,
        accessToken: tokens.accessToken,  
      },
      setCookie: refresh_cookie,
    };
  }

  @Get()
  @ResponseMesssage("성공적으로 모든 관리리자를 조회했습니다.")
  async findAll() {
    const result = await this.adminService.findAll();
    return {
      admins: result
    }
  }

  @Get(':admin_id')
  @ResponseMesssage("성공적으로 관리자를 조회했습니다.")
  async findOne(@Param('admin_id') admin_id: string) {

    const foundAdmin = await this.adminService.findOne(admin_id);

    if (!foundAdmin) {
      throw new HttpException('존재하지 않는 관지라입니다.', HttpStatus.NOT_FOUND);
    }
    const result = await this.adminService.findOne(admin_id);
    return {
      admin: result
    }
  }

  @Patch(':admin_id')
  @ResponseMesssage("성공적으로 관리자 정보를 수정했습니다.")
  async update(@Param('admin_id') admin_id: string, @Body() updateAdminDto: UpdateAdminDto) {
    const foundAdmin = await this.adminService.findOne(admin_id);

    if (!foundAdmin) {
      throw new HttpException('존재하지 않는 관지라입니다.', HttpStatus.NOT_FOUND);
    }
    const result = await this.adminService.update(admin_id, updateAdminDto);

    if (!result) {
      throw new HttpException('관리자 정보 수정에 실패했습니다.', HttpStatus.BAD_REQUEST);
    }

    const payload = {
      user_id : admin_id,
      is_admin : true,
    };
    const tokens = await this.authService.generateTokens(payload);

    const refresh_cookie = this.makeRefreshCookie(tokens.refreshToken);
    console.log('refresh_cookie:', refresh_cookie);

    return {
      data: {
        admin: result,
        accessToken: tokens.accessToken,  
      },
      setCookie: refresh_cookie,
    };

  }

  @Delete(':admin_id')
  @ResponseMesssage("성공적으로 관리자를 삭제했습니다.")
  async remove(@Param('admin_id') admin_id: string) {
    const foundAdmin = await this.adminService.findOne(admin_id);

    if (!foundAdmin) {
      throw new HttpException('존재하지 않는 관지라입니다.', HttpStatus.NOT_FOUND);
    }
    const result = await this.adminService.remove(admin_id);
    return {
      admin: result
    }
  }
}
