import { PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {

}
