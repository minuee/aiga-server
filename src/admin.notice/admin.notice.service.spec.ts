import { Test, TestingModule } from '@nestjs/testing';
import { AdminNoticeService } from './admin.notice.service';

describe('AdminNoticeService', () => {
  let service: AdminNoticeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminNoticeService],
    }).compile();

    service = module.get<AdminNoticeService>(AdminNoticeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
