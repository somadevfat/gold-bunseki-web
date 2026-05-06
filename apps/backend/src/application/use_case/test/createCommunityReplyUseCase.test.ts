import { describe, expect, it, mock } from 'bun:test';
import { CreateCommunityReplyUseCase } from '../createCommunityReplyUseCase';
import { CommunityThreadRepositoryPort } from '../../port/communityThreadRepositoryPort';
import { CommunityReply, CommunityThread, CreateCommunityReplyInput } from '../../../domain/entities/communityThread';

const mockThread: CommunityThread = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'CPI発表前後のXAUUSDの値幅について',
  body: '前回CPIでは発表直後の初動より、NY後半の戻りが大きかったです。',
  category: 'Market Discussion',
  replyCount: 0,
  createdAt: '2026-04-01T12:00:00.000Z',
};

const mockReply: CommunityReply = {
  id: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890',
  threadId: mockThread.id,
  body: 'NY後半の戻りを見る観点に同意です。',
  createdAt: '2026-04-01T12:30:00.000Z',
};

const input: CreateCommunityReplyInput = {
  body: 'NY後半の戻りを見る観点に同意です。',
};

function createMockRepo(overrides: Partial<CommunityThreadRepositoryPort> = {}): CommunityThreadRepositoryPort {
  return {
    findAll: mock(() => Promise.resolve([mockThread])),
    findById: mock(() => Promise.resolve(mockThread)),
    findReplies: mock(() => Promise.resolve([mockReply])),
    create: mock(() => Promise.resolve(mockThread)),
    createReply: mock(() => Promise.resolve(mockReply)),
    ...overrides,
  };
}

describe('CreateCommunityReplyUseCase', () => {
  it('スレッドが存在する場合、返信を作成して返すこと', async () => {
    const createReply = mock(() => Promise.resolve(mockReply));
    const repo = createMockRepo({ createReply });
    const useCase = new CreateCommunityReplyUseCase(repo);

    const result = await useCase.execute(mockThread.id, input);

    expect(result?.id).toBe(mockReply.id);
    expect(createReply).toHaveBeenCalledWith(mockThread.id, input);
  });

  it('スレッドが存在しない場合 null を返し、返信を作成しないこと', async () => {
    const createReply = mock(() => Promise.resolve(mockReply));
    const repo = createMockRepo({
      findById: mock(() => Promise.resolve(null)),
      createReply,
    });
    const useCase = new CreateCommunityReplyUseCase(repo);

    const result = await useCase.execute(mockThread.id, input);

    expect(result).toBeNull();
    expect(createReply).not.toHaveBeenCalled();
  });
});
