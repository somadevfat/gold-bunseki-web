import { describe, expect, it } from 'bun:test';
import { CreateCommunityThreadUseCase } from '../application/use_case/createCommunityThreadUseCase';
import { GetCommunityThreadsUseCase } from '../application/use_case/getCommunityThreadsUseCase';
import { createAppContainer, freezeAppContainer } from './container';
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

  it('グローバル利用するContainerの依存配線をfreezeできること', () => {
    const container = freezeAppContainer(createAppContainer(createMockDrizzle()));

    expect(Object.isFrozen(container)).toBe(true);
    expect(Object.isFrozen(container.repositories)).toBe(true);
    expect(Object.isFrozen(container.useCases)).toBe(true);
    expect(Object.isFrozen(container.useCases.community)).toBe(true);
  });
});
