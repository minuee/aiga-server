import { Test, TestingModule } from '@nestjs/testing';
import { AdminNoticeController } from './admin.notice.controller';
import { AdminNoticeService } from './admin.notice.service';

describe('AdminNoticeController', () => {
  let controller: AdminNoticeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminNoticeController],
      providers: [AdminNoticeService],
    }).compile();

    controller = module.get<AdminNoticeController>(AdminNoticeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
