import { Test, TestingModule } from '@nestjs/testing';
import { AdminOpinionService } from './admin.opinion.service';

describe('AdminOpinionService', () => {
  let service: AdminOpinionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminOpinionService],
    }).compile();

    service = module.get<AdminOpinionService>(AdminOpinionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
