import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Req, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ResponseMesssage } from 'src/common/decorators/response-message-decorator';
import { Utils } from 'src/common/utils/utils';
import { Request } from 'express';
import { UserGuard } from 'src/common/guards/user.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post()
  @ResponseMesssage("성공적으로 리뷰를 작성 했습니다.")
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req: Request) {

    const user_id = req.user_id ?? "";

    const result = await this.reviewsService.create(createReviewDto, user_id);
    return {
      review: result
    }
  }

  @Get()
  @ResponseMesssage("성공적으로 모든 리뷰를 조회 했습니다.")
  async findAll(@Query('doctor_id', ParseIntPipe) doctor_id: number) {

    const result = await this.reviewsService.findAll(doctor_id);
    return {
      review: result
    }
  }

  @Get(':review_id')
  @ResponseMesssage("성공적으로 리뷰를 조회 했습니다.")
  async findOne(@Param('review_id', ParseIntPipe) review_id: number, @Req() req: Request) {

    // const user_id = Utils.checkAuthorization(req);

    const foundReview = await this.reviewsService.findOne(review_id);

    if (!foundReview) {
      throw new HttpException('존재하지 않는 리뷰입니다.', HttpStatus.NOT_FOUND);
    }

    return {
      review: foundReview
    }
  }

  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Patch(':review_id')
  @ResponseMesssage("성공적으로 리뷰를 수정 했습니다.")
  async update(@Param('review_id', ParseIntPipe) review_id: number, @Body() updateReviewDto: UpdateReviewDto, @Req() req: Request) {
    // const user_id = Utils.checkAuthorization(req);
    const user_id = req.user_id ?? "";
    
    const foundReview = await this.reviewsService.findOne(review_id);

    if (!foundReview) {
      throw new HttpException('존재하지 않는 리뷰입니다.', HttpStatus.NOT_FOUND);
    }

    const result = await this.reviewsService.update(review_id, updateReviewDto);
    return {
      review: result
    }
  }

  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Delete(':review_id')
  @ResponseMesssage("성공적으로 리뷰를 삭제 했습니다.")
  async remove(@Param('review_id', ParseIntPipe) review_id: number, @Req() req: Request) {

    // const user_id = Utils.checkAuthorization(req);
    const user_id = req.user_id ?? "";

    const foundReview = await this.reviewsService.findOne(review_id);

    if (!foundReview) {
      throw new HttpException('존재하지 않는 리뷰입니다.', HttpStatus.NOT_FOUND);
    }

    const result = await this.reviewsService.remove(review_id);
    return {
      review: result
    }
  }
}
