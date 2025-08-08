import { createHash } from 'crypto';

/**
 * 닉네임 생성 옵션 인터페이스
 */
interface NicknameOptions {
  userId?: string;
  pattern?: 'simple' | 'color' | 'full' | 'random';
}

/**
 * 닉네임 생성 결과 타입
 */
type NicknameResult = {
  nickname: string;
  pattern: string;
  components: {
    adjective?: string;
    color?: string;
    noun: string;
  };
};

/**
 * 건강 및 의료 서비스용 닉네임 생성 클래스
 */
export class HealthNicknameGenerator {
  private readonly healthAdjectives: readonly string[] = [
    '건강한', '활기찬', '튼튼한', '밝은', '긍정적인', '씩씩한', '생기있는',
    '든든한', '원기왕성한', '활력있는', '상쾌한', '청량한', '맑은', '깨끗한',
    '따뜻한', '부드러운', '안정된', '평온한', '차분한', '꾸준한', '성실한',
    '정직한', '신뢰할수있는', '배려깊은', '친절한', '다정한', '온화한'
  ] as const;

  private readonly healthNouns: readonly string[] = [
    '나무', '꽃', '새싹', '잎사귀', '햇살', '바람', '구름', '별', '달',
    '산', '강', '바다', '들판', '정원', '숲', '오솔길', '샘물', '이슬',
    '무지개', '나비', '새', '토끼', '다람쥐', '고양이', '강아지',
    '사과', '딸기', '복숭아', '포도', '오렌지', '바나나', '체리',
    '민트', '라벤더', '로즈마리', '카모마일', '유칼립투스'
  ] as const;

  private readonly softColors: readonly string[] = [
    '하늘색', '연두색', '분홍색', '연보라색', '크림색', '베이지색',
    '민트색', '복숭아색', '라벤더색', '아이보리색', '파스텔색'
  ] as const;

  /**
   * 시드 기반 랜덤 숫자 생성
   */
  private seededRandom(seed: number, max: number): number {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
  }

  /**
   * 사용자 ID를 기반으로 시드 생성
   */
  private generateSeed(userId?: string): number {
    if (userId) {
      const hash = createHash('md5').update(userId).digest('hex');
      return parseInt(hash.substring(0, 8), 16);
    }
    return Math.floor(Math.random() * 1000000);
  }

  /**
   * 기본 닉네임 생성
   */
  generate(options: NicknameOptions = {}): string {
    const { userId, pattern = 'random' } = options;
    const seed = this.generateSeed(userId);

    const adjIndex = this.seededRandom(seed, this.healthAdjectives.length);
    const nounIndex = this.seededRandom(seed + 1, this.healthNouns.length);
    const colorIndex = this.seededRandom(seed + 2, this.softColors.length);

    switch (pattern) {
      case 'simple':
        return `${this.healthAdjectives[adjIndex]} ${this.healthNouns[nounIndex]}`;
      case 'color':
        return `${this.softColors[colorIndex]} ${this.healthNouns[nounIndex]}`;
      case 'full':
        return `${this.healthAdjectives[adjIndex]} ${this.softColors[colorIndex]} ${this.healthNouns[nounIndex]}`;
      case 'random':
      default:
        const patterns = [
          () => `${this.healthAdjectives[adjIndex]} ${this.healthNouns[nounIndex]}`,
          () => `${this.softColors[colorIndex]} ${this.healthNouns[nounIndex]}`,
          () => `${this.healthAdjectives[adjIndex]} ${this.softColors[colorIndex]} ${this.healthNouns[nounIndex]}`
        ];
        const patternIndex = this.seededRandom(seed + 3, patterns.length);
        return patterns[patternIndex]();
    }
  }

  /**
   * 상세 정보와 함께 닉네임 생성
   */
  generateDetailed(options: NicknameOptions = {}): NicknameResult {
    const { userId, pattern = 'random' } = options;
    const seed = this.generateSeed(userId);

    const adjIndex = this.seededRandom(seed, this.healthAdjectives.length);
    const nounIndex = this.seededRandom(seed + 1, this.healthNouns.length);
    const colorIndex = this.seededRandom(seed + 2, this.softColors.length);

    let nickname: string;
    let usedPattern: string;
    let components: NicknameResult['components'];

    switch (pattern) {
      case 'simple':
        nickname = `${this.healthAdjectives[adjIndex]} ${this.healthNouns[nounIndex]}`;
        usedPattern = 'simple';
        components = {
          adjective: this.healthAdjectives[adjIndex],
          noun: this.healthNouns[nounIndex]
        };
        break;
      case 'color':
        nickname = `${this.softColors[colorIndex]} ${this.healthNouns[nounIndex]}`;
        usedPattern = 'color';
        components = {
          color: this.softColors[colorIndex],
          noun: this.healthNouns[nounIndex]
        };
        break;
      case 'full':
        nickname = `${this.healthAdjectives[adjIndex]} ${this.softColors[colorIndex]} ${this.healthNouns[nounIndex]}`;
        usedPattern = 'full';
        components = {
          adjective: this.healthAdjectives[adjIndex],
          color: this.softColors[colorIndex],
          noun: this.healthNouns[nounIndex]
        };
        break;
      case 'random':
      default:
        const patternIndex = this.seededRandom(seed + 3, 3);
        switch (patternIndex) {
          case 0:
            nickname = `${this.healthAdjectives[adjIndex]} ${this.healthNouns[nounIndex]}`;
            usedPattern = 'simple';
            components = {
              adjective: this.healthAdjectives[adjIndex],
              noun: this.healthNouns[nounIndex]
            };
            break;
          case 1:
            nickname = `${this.softColors[colorIndex]} ${this.healthNouns[nounIndex]}`;
            usedPattern = 'color';
            components = {
              color: this.softColors[colorIndex],
              noun: this.healthNouns[nounIndex]
            };
            break;
          case 2:
          default:
            nickname = `${this.healthAdjectives[adjIndex]} ${this.softColors[colorIndex]} ${this.healthNouns[nounIndex]}`;
            usedPattern = 'full';
            components = {
              adjective: this.healthAdjectives[adjIndex],
              color: this.softColors[colorIndex],
              noun: this.healthNouns[nounIndex]
            };
            break;
        }
    }

    return {
      nickname,
      pattern: usedPattern,
      components
    };
  }

  /**
   * 여러 개의 닉네임 후보 생성
   */
  generateCandidates(count: number = 3, userId?: string): string[] {
    const candidates: string[] = [];
    const baseUserId = userId || Date.now().toString();

    for (let i = 0; i < count; i++) {
      const uniqueId = `${baseUserId}_${i}`;
      candidates.push(this.generate({ userId: uniqueId }));
    }

    return candidates;
  }

  /**
   * 중복되지 않는 닉네임 생성
   */
  generateUnique(
    existingNicknames: string[] = [],
    options: NicknameOptions = {}
  ): string {
    const nickname = this.generate(options);

    if (!existingNicknames.includes(nickname)) {
      return nickname;
    }

    // 중복되면 숫자를 붙여서 대안 생성
    let counter = 1;
    let newNickname: string;

    do {
      newNickname = `${nickname} ${counter}`;
      counter++;
    } while (existingNicknames.includes(newNickname) && counter < 100);

    if (counter >= 100) {
      // 너무 많은 중복이면 새로운 닉네임 생성
      const { userId } = options;
      return this.generate({
        userId: userId ? `${userId}_${Date.now()}` : undefined
      });
    }

    return newNickname;
  }
}

/**
 * 기본 인스턴스 생성 및 편의 함수들
 */
const defaultGenerator = new HealthNicknameGenerator();

/**
 * 건강 및 의료 서비스용 닉네임 생성 함수
 */
export const generateHealthNickname = (userId?: string): string => {
  return defaultGenerator.generate({ userId });
};

/**
 * 여러 개의 닉네임 후보를 생성하는 함수
 */
export const generateHealthNicknameCandidates = (
  count: number = 3,
  userId?: string
): string[] => {
  return defaultGenerator.generateCandidates(count, userId);
};

/**
 * 닉네임 중복 체크 및 대안 생성 함수
 */
export const generateUniqueHealthNickname = (
  existingNicknames: string[] = [],
  userId?: string
): string => {
  return defaultGenerator.generateUnique(existingNicknames, { userId });
};

/**
 * 상세 정보와 함께 닉네임 생성하는 함수
 */
export const generateDetailedHealthNickname = (
  options: NicknameOptions = {}
): NicknameResult => {
  return defaultGenerator.generateDetailed(options);
};

// 기본 export
export default HealthNicknameGenerator;
