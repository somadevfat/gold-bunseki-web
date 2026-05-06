import { describe, expect, it, mock } from 'bun:test';
import { GetCommunityThreadDetailUseCase } from '../getCommunityThreadDetailUseCase';
import { CommunityThreadRepositoryPort } from '../../port/communityThreadRepositoryPort';
import { CommunityReply, CommunityThread } from '../../../domain/entities/communityThread';

const mockThread: CommunityThread = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'CPI発表前後のXAUUSDの値幅について',
  body: '前回CPIでは発表直後の初動より、NY後半の戻りが大きかったです。',
  category: 'Market Discussion',
  replyCount: 1,
  createdAt: '2026-04-01T12:00:00.000Z',
};

const mockReply: CommunityReply = {
  id: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890',
  threadId: mockThread.id,
  body: 'NY後半の戻りを見る観点に同意です。',
  createdAt: '2026-04-01T12:30:00.000Z',
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

describe('GetCommunityThreadDetailUseCase', () => {
  it('スレッドと返信一覧をまとめて返すこと', async () => {
    const repo = createMockRepo();
    const useCase = new GetCommunityThreadDetailUseCase(repo);

    const result = await useCase.execute(mockThread.id);

    expect(result?.thread.id).toBe(mockThread.id);
    expect(result?.replies).toHaveLength(1);
    expect(repo.findReplies).toHaveBeenCalledWith(mockThread.id);
  });

  it('スレッドが存在しない場合 null を返し、返信一覧を取得しないこと', async () => {
    const findReplies = mock(() => Promise.resolve([mockReply]));
    const repo = createMockRepo({
      findById: mock(() => Promise.resolve(null)),
      findReplies,
    });
    const useCase = new GetCommunityThreadDetailUseCase(repo);

    const result = await useCase.execute(mockThread.id);

    expect(result).toBeNull();
    expect(findReplies).not.toHaveBeenCalled();
  });
});
