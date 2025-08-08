import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma.service';
import { Admin } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminService {

  constructor(private prismaService: PrismaService) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {

    let aid = createAdminDto.admin_id ? createAdminDto.admin_id : `aid_${uuidv4()}`;

    const data = {
      ...createAdminDto,
      admin_id: aid,
    };

    return await this.prismaService.admin.create({
      data
    });
  }

  async findAll(): Promise<Admin[]> {
    return this.prismaService.admin.findMany({
      // where: {
      //   user_id,
      // },
    });
  }

  async findOne(admin_id: string) : Promise<Admin | null> {
    return this.prismaService.admin.findUnique({
      where: {
        admin_id,
      },
    });
  }

  async update(admin_id: string, updateAdminDto: UpdateAdminDto) : Promise<Admin | null> {
    const data = {...updateAdminDto};

    return this.prismaService.admin.update({
      where: {
        admin_id,
      },
      data
    });
  }

  async remove(admin_id: string) : Promise<Admin> {
    return this.prismaService.admin.delete({
      where: {
        admin_id,
      },
    });
  }
}