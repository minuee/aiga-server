import { Test, TestingModule } from '@nestjs/testing';
import { AdminOpinionController } from './admin.opinion.controller';
import { AdminOpinionService } from './admin.opinion.service';

describe('AdminOpinionController', () => {
  let controller: AdminOpinionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminOpinionController],
      providers: [AdminOpinionService],
    }).compile();

    controller = module.get<AdminOpinionController>(AdminOpinionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
