import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {

  constructor(private prismaService: PrismaService) {}


  async create(createUserDto: CreateUserDto): Promise<User> {

    let uid = '';
    if( createUserDto.user_id ) {
      uid = createUserDto.user_id;
    }
    else {
      uid = `uid_${uuidv4()}`;
    }   

    return await this.prismaService.user.create({
      data: {
        user_id: uid,
        sns_type: createUserDto.sns_type,
        sns_id: createUserDto.sns_id,
        email: createUserDto.email,
        nickname: createUserDto.nickname,
        profile_img: createUserDto.profile_img,
        agreement: createUserDto.agreement
      },
    });
  }

  async findAll() : Promise<User[]> {
    return this.prismaService.user.findMany();
  }

  async findOne(user_id: string) : Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        user_id,
      },
    });
  }

  async findBySns(sns_type: string, sns_id: string) : Promise<User | null> {
    // findUnique, update, delete: 반드시 unique 제약 조건의 
    // 필요하면 prisma에 User 모델에
    // @@unique([sns_type, sns_id]) 선언해야 한다.
    // return this.prismaService.user.findUnique({
    //   where: {
    //     sns_type,
    //     sns_id,
    //   },
    // });

    // 중복허용: findFirst, findMany, updateMany
    return this.prismaService.user.findFirst({
      where: {
        sns_type,
        sns_id,
      },
    });

  }

  async update(user_id: string, updateUserDto: UpdateUserDto) : Promise<User> {

    // const data = {
    //   sns_type: updateUserDto.sns_type,
    //   sns_id: updateUserDto.sns_id,
    //   email: updateUserDto.email,
    //   nickname: updateUserDto.nickname,
    //   profile_img: updateUserDto.profile_img,
    //   updatedAt: new Date(),
    // };
    const data = updateUserDto;
    console.log('data:', data);

    return this.prismaService.user.update({
      where: {
        user_id,
      },
      data
    });
  }

  async agreement(user_id: string) : Promise<User> {

    const data = {
      agreement: true,
    };
    console.log('agreement data:', data);

    return this.prismaService.user.update({
      where: {
        user_id,
      },
      data
    });
  }


  async remove(user_id: string) : Promise<User> {
    // return this.prismaService.user.delete({
    //   where: {
    //     user_id,
    //   },
    // });
    // 개인정보 데이타만 삭제
    return this.prismaService.user.update({
      where: {
        user_id,
      },
      data: {
        email: '',
        nickname:  '',
        profile_img:  '',
        unregist_date: new Date(),
        agreement: false
      },
    });
  }

}
