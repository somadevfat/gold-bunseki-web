import { describe, expect, it } from 'bun:test';
import { CreateCommunityThreadUseCase } from '../application/use_case/createCommunityThreadUseCase';
import { GetCommunityThreadsUseCase } from '../application/use_case/getCommunityThreadsUseCase';
import { createAppContainer } from './container';
import { createMockDrizzle } from '../interface/test/testHelpers';

describe('createAppContainer', () => {
  it('Repository と掲示板 UseCase を一箇所で生成して配線すること', () => {
    const container = createAppContainer(createMockDrizzle());

    expect(container.repositories.communityThreadRepo).toBeDefined();
    expect(container.repositories.priceRepo).toBeDefined();
    expect(container.repositories.syncRepo).toBeDefined();
    expect(container.useCases.community.getThreads).toBeInstanceOf(GetCommunityThreadsUseCase);
    expect(container.useCases.community.createThread).toBeInstanceOf(CreateCommunityThreadUseCase);
  });
});
