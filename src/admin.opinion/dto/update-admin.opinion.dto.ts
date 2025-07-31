import { PartialType } from '@nestjs/swagger';
import { CreateAdminOpinionDto } from './create-admin.opinion.dto';

export class UpdateAdminOpinionDto extends PartialType(CreateAdminOpinionDto) {}
