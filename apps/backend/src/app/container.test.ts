import { describe, expect, it } from 'bun:test';
import { CalculateZigZagUseCase } from '../application/use_case/calculateZigZagUseCase';
import { CreateCommunityReplyUseCase } from '../application/use_case/createCommunityReplyUseCase';
import { CreateCommunityThreadUseCase } from '../application/use_case/createCommunityThreadUseCase';
import { CreateResearchNoteUseCase } from '../application/use_case/createResearchNoteUseCase';
import { DeleteResearchNoteUseCase } from '../application/use_case/deleteResearchNoteUseCase';
import { GetCommunityThreadDetailUseCase } from '../application/use_case/getCommunityThreadDetailUseCase';
import { GetCommunityThreadsUseCase } from '../application/use_case/getCommunityThreadsUseCase';
import { GetLatestPriceUseCase } from '../application/use_case/getLatestPriceUseCase';
import { GetRecentEventNamesUseCase } from '../application/use_case/getRecentEventNamesUseCase';
import { GetRecentSessionsWithAutoSyncUseCase } from '../application/use_case/getRecentSessionsWithAutoSyncUseCase';
import { GetReplayDataUseCase } from '../application/use_case/getReplayDataUseCase';
import { GetResearchNotesUseCase } from '../application/use_case/getResearchNotesUseCase';
import { GetSyncStatusUseCase } from '../application/use_case/getSyncStatusUseCase';
import { UpdateResearchNoteUseCase } from '../application/use_case/updateResearchNoteUseCase';
import { createAppContainer, freezeAppContainer } from './container';
import { createMockDrizzle } from '../interface/test/testHelpers';

describe('createAppContainer', () => {
  it('Repository と UseCase を一箇所で生成して配線すること', () => {
    const container = createAppContainer(createMockDrizzle());

    expect(container.repositories.communityThreadRepo).toBeDefined();
    expect(container.repositories.researchNoteRepo).toBeDefined();
    expect(container.repositories.priceRepo).toBeDefined();
    expect(container.repositories.syncRepo).toBeDefined();
    expect(container.useCases.community.getThreads).toBeInstanceOf(GetCommunityThreadsUseCase);
    expect(container.useCases.community.getThreadDetail).toBeInstanceOf(GetCommunityThreadDetailUseCase);
    expect(container.useCases.community.createThread).toBeInstanceOf(CreateCommunityThreadUseCase);
    expect(container.useCases.community.createReply).toBeInstanceOf(CreateCommunityReplyUseCase);
    expect(container.useCases.researchNotes.getNotes).toBeInstanceOf(GetResearchNotesUseCase);
    expect(container.useCases.researchNotes.createNote).toBeInstanceOf(CreateResearchNoteUseCase);
    expect(container.useCases.researchNotes.updateNote).toBeInstanceOf(UpdateResearchNoteUseCase);
    expect(container.useCases.researchNotes.deleteNote).toBeInstanceOf(DeleteResearchNoteUseCase);
    expect(container.useCases.sync.getStatus).toBeInstanceOf(GetSyncStatusUseCase);
    expect(container.useCases.market.getLatestPrice).toBeInstanceOf(GetLatestPriceUseCase);
    expect(container.useCases.market.calculateZigZag).toBeInstanceOf(CalculateZigZagUseCase);
    expect(container.useCases.market.getRecentSessions).toBeInstanceOf(GetRecentSessionsWithAutoSyncUseCase);
    expect(container.useCases.market.getReplayData).toBeInstanceOf(GetReplayDataUseCase);
    expect(container.useCases.market.getIndicators).toBeInstanceOf(GetRecentEventNamesUseCase);
  });

  it('グローバル利用するContainerの依存配線をfreezeできること', () => {
    const container = freezeAppContainer(createAppContainer(createMockDrizzle()));

    expect(Object.isFrozen(container)).toBe(true);
    expect(Object.isFrozen(container.repositories)).toBe(true);
    expect(Object.isFrozen(container.useCases)).toBe(true);
    expect(Object.isFrozen(container.useCases.community)).toBe(true);
    expect(Object.isFrozen(container.useCases.researchNotes)).toBe(true);
    expect(Object.isFrozen(container.useCases.sync)).toBe(true);
    expect(Object.isFrozen(container.useCases.market)).toBe(true);
  });
});
