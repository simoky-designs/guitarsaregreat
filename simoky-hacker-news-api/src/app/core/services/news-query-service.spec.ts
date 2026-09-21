import { TestBed } from '@angular/core/testing';
import { PageEvent } from '@angular/material/paginator';
import { Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsItem } from '../interfaces/news';
import { ApiService } from './api-service';
import { NewsQueryService } from './news-query-service';

const createItems = (page: number): NewsItem[] =>
  Array.from({ length: 100 }, (_, index) => ({
    id: (page - 1) * 100 + index + 1,
    score: (page - 1) * 100 + index + 1,
    title: `Story ${page}-${index + 1}`,
    by: index % 2 === 0 ? 'alice' : 'bob',
  }));

class MockApiService {
  readonly storyIdCalls: string[] = [];
  readonly storyCalls: number[] = [];

  getStoryIds(type: 'top' | 'new'): Observable<number[]> {
    this.storyIdCalls.push(type);
    return of(Array.from({ length: 250 }, (_, index) => index + 1));
  }

  getStory(id: number): Observable<NewsItem> {
    this.storyCalls.push(id);
    return of({
      id,
      score: id,
      title: `Story ${Math.ceil(id / 100)}-${((id - 1) % 100) + 1}`,
      by: id % 2 === 1 ? 'alice' : 'bob',
    });
  }
}

describe('NewsQueryService', () => {
  let service: NewsQueryService;
  let apiService: MockApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NewsQueryService,
        { provide: ApiService, useClass: MockApiService },
      ],
    });

    service = TestBed.inject(NewsQueryService);
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
  });

  it('starts with no visible items', () => {
    expect(service.visibleItems()).toEqual([]);
    expect(service.loading()).toBe(false);
  });

  it('loads the first page and exposes the configured page slice', () => {
    service.load();

    expect(apiService.storyIdCalls).toEqual(['top']);
    expect(apiService.storyCalls).toHaveLength(100);
    expect(service.visibleItems()).toEqual(createItems(1).slice(0, 25));
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('exposes an error and stops loading when a normal request fails', () => {
    vi.spyOn(apiService, 'getStory').mockReturnValue(
      throwError(() => new Error('Request failed')),
    );

    service.load();

    expect(service.error()).toBe('Failed to load news');
    expect(service.loading()).toBe(false);
    expect(service.response()).toBeNull();
  });

  it('updates the computed slice when the page changes', () => {
    service.load();
    service.onPageChange({ pageIndex: 1, pageSize: 10 } as PageEvent);

    expect(service.visibleItems()).toEqual(createItems(1).slice(10, 20));
  });

  it('sorts visible items in both directions', () => {
    service.load();
    service.onSortChange({ active: 'score', direction: 'desc' });

    expect(service.visibleItems()[0].score).toBe(100);

    service.onSortChange({ active: 'score', direction: 'asc' });

    expect(service.visibleItems()[0].score).toBe(1);
  });

  it('keeps loaded stories when navigating backward', () => {
    service.load();
    service.onPageChange({ pageIndex: 10, pageSize: 10 } as PageEvent);
    service.onPageChange({ pageIndex: 0, pageSize: 10 } as PageEvent);

    expect(apiService.storyIdCalls).toEqual(['top']);
    expect(apiService.storyCalls).toHaveLength(200);
    expect(service.response()?.items).toHaveLength(200);
    expect(service.visibleItems()[0].id).toBe(1);
  });

  it('loads the next 100 stories only when navigating forward into it', () => {
    service.load(1);
    service.onPageChange({ pageIndex: 10, pageSize: 10 } as PageEvent);

    expect(apiService.storyIdCalls).toEqual(['top']);
    expect(apiService.storyCalls).toHaveLength(200);
    expect(service.response()?.page).toBe(2);
    expect(service.visibleItems()[0].id).toBe(101);
  });

  it('does not load another chunk while navigating within the current chunk', () => {
    service.load(1);
    service.onPageChange({ pageIndex: 9, pageSize: 10 } as PageEvent);

    expect(apiService.storyCalls).toHaveLength(100);
  });
});
