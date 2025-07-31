import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis = new Redis();

  // 개별 토큰 저장 (TTL 적용)
  async addGuestToken(guestId: string, usedToken: number, ttlSec: number): Promise<void> {
    const timestamp = Date.now();
    const key = `guest_token:${guestId}:${timestamp}`;
    await this.redis.set(key, usedToken, 'EX', ttlSec);
  }

  // 24시간 내 사용된 토큰 총합 조회
  async getGuestTokenTotal(guestId: string): Promise<number> {
    const pattern = `guest_token:${guestId}:*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length === 0) return 0;
    
    const values = await this.redis.mget(keys);
    return values.reduce((sum, value) => sum + (Number(value) || 0), 0);
  }

  // 게스트 제한 설정 (16시간)
  async setGuestRestriction(guestId: string, restrictionHours: number = 16): Promise<void> {
    const key = `restricted_guest:${guestId}`;
    const ttlSec = restrictionHours * 3600; // 시간을 초로 변환
    await this.redis.set(key, Date.now(), 'EX', ttlSec);
  }

  // 게스트 제한 여부 확인
  async isGuestRestricted(guestId: string): Promise<{ restricted: boolean; remainingTime?: number }> {
    const key = `restricted_guest:${guestId}`;
    const ttl = await this.redis.ttl(key);
    
    if (ttl > 0) {
      // 제한 중 - 남은 시간(초) 반환
      return { 
        restricted: true, 
        remainingTime: ttl 
      };
    }
    
    return { restricted: false };
  }

  // 게스트 제한 해제 (테스트용)
  async removeGuestRestriction(guestId: string): Promise<void> {
    const key = `restricted_guest:${guestId}`;
    await this.redis.del(key);
  }

  // 기존 메서드들 (필요시 유지)
  async increaseGuestToken(guestId: string, amount: number, ttlSec: number): Promise<number> {
    const key = `guest_token:${guestId}`;
    const current = await this.redis.incrby(key, amount);
    await this.redis.expire(key, ttlSec);
    return current;
  }

  async getGuestToken(guestId: string): Promise<number> {
    const key = `guest_token:${guestId}`;
    const value = await this.redis.get(key);
    return Number(value) || 0;
  }
}