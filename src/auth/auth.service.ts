import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  private readonly redirect_url_google: string;
  private readonly redirect_url_kakao: string;
  private readonly redirect_url_naver: string;

  constructor(private readonly jwtService: JwtService) {
    let server;
    if(process.env.RUN_MODE?.toLowerCase() === 'local') {
      server = `${process.env.DOMAIN}:${process.env.PORT}`;
    }
    else {
      server = process.env.DOMAIN;
    }

    this.redirect_url_google = `${server}/api/auth/google/callback`;
    this.redirect_url_kakao = `${server}/api/auth/kakao/callback`;
    this.redirect_url_naver = `${server}/api/auth/naver/callback`;
  }

  // create(createAuthDto: CreateAuthDto) {
  //   return 'This action adds a new auth';
  // }

  redirectUrl(provider: string) {
    switch (provider) {
      case 'google':
        return this.getGoogleLoginUrl();
      case 'kakao':
        return this.getKakaoLoginUrl();
      case 'naver':
        return this.getNaverLoginUrl();
      default:
        throw new Error('Unsupported provider');
    }
  }

  async getTokensAndUserInfo(provider: string, code: string) {
    switch (provider) {
      case 'google':
        return this.googleFlow(code);
      case 'kakao':
        return this.kakaoFlow(code);
      case 'naver':
        return this.naverFlow(code);
      default:
        throw new Error('Unsupported provider');
    }
  }

  private getGoogleLoginUrl(): string {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      // redirect_uri: 'http://localhost:5000/auth/google/callback',
      redirect_uri: this.redirect_url_google,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' '),
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  private getKakaoLoginUrl(): string {
    const rootUrl = 'https://kauth.kakao.com/oauth/authorize';
    const options = {
      client_id: process.env.KAKAO_CLIENT_ID ?? '',
      // redirect_uri: 'http://localhost:5000/auth/kakao/callback',
      redirect_uri: this.redirect_url_kakao,
      response_type: 'code',
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  private getNaverLoginUrl(): string {
    const rootUrl = 'https://nid.naver.com/oauth2.0/authorize';
    const options = {
      client_id: process.env.NAVER_CLIENT_ID ?? '',
      // redirect_uri: 'http://localhost:5000/auth/naver/callback',
      redirect_uri: this.redirect_url_naver,
      response_type: 'code',
      state: 'STATE_STRING',  // CSRF 방어용 (적당히 랜덤하게)
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async googleFlow(code: string) {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: 'YOUR_GOOGLE_CLIENT_ID',
      client_secret: 'YOUR_GOOGLE_CLIENT_SECRET',
      // redirect_uri: 'http://localhost:5000/auth/google/callback',
      redirect_uri: this.redirect_url_google,
      grant_type: 'authorization_code',
    };

    const tokenRes = await axios.post(url, values, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      accessToken,
      userInfo: userRes.data,
    };
  }

  private async kakaoFlow(code: string) {
    // kakao token + userinfo 요청
    const tokenRes = await axios.post('https://kauth.kakao.com/oauth/token', new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID ?? '',
      // redirect_uri: 'http://localhost:5000/auth/kakao/callback',
      redirect_uri: this.redirect_url_kakao,
      code,
      // client_secret: process.env.KAKAO_CLIENT_SECRET,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      accessToken,
      userInfo: userRes.data,
    };
  }

  private async naverFlow(code: string) {
    // naver token + userinfo 요청
    const tokenRes = await axios.post('https://nid.naver.com/oauth2.0/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: process.env.NAVER_CLIENT_ID,
        client_secret: process.env.NAVER_CLIENT_SECRET,
        code,
        state: 'STATE_STRING',
      },
    });

    // console.log('tokenRes.data:', tokenRes.data);

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      accessToken,
      userInfo: userRes.data.response,
    };
  }

  async generateTokens(payload: any) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });

    return { accessToken, refreshToken };
  }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
