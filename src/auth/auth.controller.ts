import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CryptoUtil } from 'src/common/utils/crypto.util';
import { ResponseMesssage, SkipResponseTransform } from 'src/common/decorators/response-message-decorator';
import { UsersService } from 'src/users/users.service';
import { UserGuard } from 'src/common/guards/user.guard';
import { generateHealthNickname } from 'src/common/utils/generateNickname';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {

  }

  @UseGuards(UserGuard)
  @Get('refresh')
  @ResponseMesssage("성공적으로 새로운 access_token이 발급되었습니다.")
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const newAccessToken = await this.jwtService.signAsync(
        { 
          user_id: payload.user_id, 
          sns_id: payload.sns_id,
          sns_type: payload.sns_type
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
        },
      );

      return { access_token: newAccessToken };
    } catch (err) {
      throw new UnauthorizedException('세션 만료, 다시 로그인하세요');
    }
  }

  @UseGuards(UserGuard)
  @Get('logout')
  @ResponseMesssage("성공적으로 로그아웃되었습니다.")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {

    const refreshToken = req.cookies['refresh_token'];
    let user_id = req.user_id;

    if (!refreshToken ) {
      throw new UnauthorizedException('refresh token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if(user_id !== payload.user_id) {
        throw new UnauthorizedException('Invalid access token, 다시 로그인하세요');
      }
  
      // 쿠키 삭제
      res.clearCookie('refresh_token', { path: '/' });
      
    } catch (err) {
      throw new UnauthorizedException('세션 만료, 다시 로그인하세요');
    }

    return {
      user_id: user_id
    };
  }

  @Get(':provider')
  @ResponseMesssage("")
  redirectUrl(@Param('provider') provider: string, @Res() res: Response) {
    const url = this.authService.redirectUrl(provider);
    return res.redirect(url);
  }

  @Get(':provider/callback')
  @SkipResponseTransform()
  @ResponseMesssage("성공적으로 로그인 인증이 완료되었습니다.")
  async login(@Param('provider') provider: string, @Query('code') code: string, @Res() res: Response,) {

    // const code = req.query.code;

    const { accessToken, userInfo } = await this.authService.getTokensAndUserInfo(provider, code);

    const sns_id = String(userInfo.id);
    const sns_type = provider;
    
    let email: string, nickname: string, profile_img: string;

    if (sns_type === 'naver') {
      email = userInfo.email;
      nickname = userInfo.nickname;
      profile_img = userInfo.profile_image;
    }
    else {
      email = userInfo.kakao_account.email;
      nickname = userInfo.kakao_account?.profile?.nickname;
      profile_img = userInfo.kakao_account?.profile?.profile_image_url;
    }

    if(!nickname) {
      const nickname_raw = generateHealthNickname(sns_id);
      nickname = `${nickname_raw}-${Math.floor(Math.random() * 1000000)}`;
    }

    const userBasic = {
      user_id:"",
      sns_type, 
      sns_id,
      email,
      nickname,
      profile_img,
      agreement: false
    }

    // sns 유저 검색후, 갱신/저장
    const foundUser = await this.usersService.findBySns(sns_type, sns_id);

    let user;
    let returnUserBasic;
    if (foundUser) {  // 기존 유저
      // 탈퇴일(unregist_date)이 있고, 24시간이 경과되지 않았으면 가입 불가   
      if(foundUser.unregist_date) {
        const unregist_date = new Date(foundUser.unregist_date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - unregist_date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if(diffDays < parseInt(process.env.REJOIN_BLOCK_PERIOD || '24')) {
          throw new UnauthorizedException('탈퇴한 유저입니다. 24시간 후에 다시 로그인하세요');
        }
      }
   
      // 기존 정보를 우선으로 처리. 탈퇴후 재가입이면 email, nickname, profile_img, agreement 정보가 제거된 상태.
      const user_id = foundUser.user_id;
      const sns_type = foundUser.sns_type;
      const sns_id = foundUser.sns_id;
      const email = foundUser.email || userBasic.email;
      const nickname = foundUser.nickname || userBasic.nickname;
      const profile_img = foundUser.profile_img || userBasic.profile_img;
      const agreement = foundUser.agreement;

      user = {
        user_id,
        sns_type,
        sns_id,
        email,
        nickname,
        profile_img,
        regist_date: new Date(),
        unregist_date: null,
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        agreement
      }
      const decryptedEmail = CryptoUtil.decrypt(email); // your custom function
      const decryptedProfileImg = profile_img ? CryptoUtil.decrypt(profile_img) : ''; // your custom function
      returnUserBasic = {
        ...user,
        email : decryptedEmail,
        profile_img : decryptedProfileImg,
      }
      await this.usersService.update(user_id, user);
    }else {  // 신규 유저
      const encryptedEmail = CryptoUtil.encrypt(email); // your custom function
      const encryptedProfileImg = profile_img ? CryptoUtil.encrypt(profile_img) : ''; // your custom function
      returnUserBasic = {
        ...userBasic,
        email,
        profile_img
      }
      const userBasicReform = {
        ...userBasic,
        email : encryptedEmail,
        profile_img : encryptedProfileImg,
      }
      user = await this.usersService.create(userBasicReform);
    }

    const payload = {
      user_id: user.user_id,
      sns_type,
      sns_id
    };
    const tokens = await this.authService.generateTokens(payload);

    // res.cookie('refresh_token', tokens.refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   path: '/',
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    const refresh_token_expiration = parseInt(process.env.REFRESH_TOKEN_EXPIRATION || '7');

    const sec_of_day = 1000 * 60 * 60 * 24;
    const refresh_token = {
      name: 'refresh_token',
      value: tokens.refreshToken,
      options: {
        httpOnly: true,
        path: '/',
        secure: false, //   process.env.NODE_ENV === 'production',
        maxAge: sec_of_day * refresh_token_expiration,
      },
    }

    res.cookie('refresh_token', refresh_token.value, refresh_token.options);

    const userReform = {
      ...returnUserBasic,
      user_id : user.user_id,
    }
  
    const result =  {
      statusCode: 200,
      message: "성공적으로 로그인 인증이 완료되었습니다.",
      data: {
        user : userReform,
        access_token: tokens.accessToken,  
      }
    };
    
    const html = `
<!DOCTYPE html>
<html>
<body>
<script>
  const code = ${JSON.stringify(result)};
  // 부모 창으로 code를 전송
  window.opener?.postMessage({ type: 'kakao-auth', code }, '*');
  // 창 자동 닫기
  window.close();
</script>
</body>
</html>
  `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  }

  
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
