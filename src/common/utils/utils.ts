import { Req, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";

export class Utils {
  static checkAuthorization(@Req() req: Request) {
    const user_id = req.user_id ?? "";
    console.log('user_id:', user_id);
    if (!user_id) {
      throw new UnauthorizedException('인증된 회원이 아닙니다.');
    }
    return user_id;
  }
}
