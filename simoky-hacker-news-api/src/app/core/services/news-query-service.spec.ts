import { TestBed } from '@angular/core/testing';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { of } from 'rxjs';

import { NewsQueryService } from './news-query-service';
import { ApiService } from './api-service';
import { LoadingService } from './loading-service';
import { NewsItem, NewsResponse } from '../interfaces/news';

describe('NewsQueryService', () => {
  let service: NewsQueryService;

  let apiService: {
    getStoryIds: ReturnType<typeof vi.fn>;
    getStory: ReturnType<typeof vi.fn>;
  };

  let loadingService: {
    show: ReturnType<typeof vi.fn>;
    hide: ReturnType<typeof vi.fn>;
    isLoading: ReturnType<typeof vi.fn>;
  };

  const createItem = (id: number, overrides: Partial<NewsItem> = {}): NewsItem =>
    ({
      id,
      title: `Story ${id}`,
      score: id,
      time: id,
      ...overrides,
    }) as NewsItem;

  beforeEach(() => {
    apiService = {
      getStoryIds: vi.fn(),
      getStory: vi.fn(),
    };

    loadingService = {
      show: vi.fn(),
      hide: vi.fn(),
      isLoading: vi.fn(() => false),
    };

    TestBed.configureTestingModule({
      providers: [
        NewsQueryService,
        {
          provide: ApiService,
          useValue: apiService,
        },
        {
          provide: LoadingService,
          useValue: loadingService,
        },
      ],
    });

    service = TestBed.inject(NewsQueryService);
  });

  describe('initial state', () => {
    it('should have the expected default values', () => {
      expect(service.response()).toBeNull();
      expect(service.loading).toBe(loadingService.isLoading);
      expect(service.pageSize()).toBe(25);
      expect(service.pageIndex()).toBe(0);
      expect(service.pageSizeOptions()).toEqual([10, 25, 50]);
      expect(service.storyType()).toBe('topstories');
      expect(service.sortValues()).toEqual({
        active: 'score',
        direction: 'asc',
      });
      expect(service.visibleItems()).toEqual([]);
    });
  });

  describe('load', () => {
    it('should load story ids and the first page of stories', () => {
      const ids = [1, 2, 3];
      const items = [createItem(1), createItem(2), createItem(3)];

      apiService.getStoryIds.mockReturnValue(of(ids));

      apiService.getStory.mockImplementation((id: number) => of(createItem(id)));

      service.load();

      expect(apiService.getStoryIds).toHaveBeenCalledOnce();
      expect(apiService.getStoryIds).toHaveBeenCalledWith('topstories');

      expect(apiService.getStory).toHaveBeenCalledTimes(3);
      expect(apiService.getStory).toHaveBeenCalledWith(1);
      expect(apiService.getStory).toHaveBeenCalledWith(2);
      expect(apiService.getStory).toHaveBeenCalledWith(3);

      expect(service.response()).toEqual({
        page: 1,
        nextPage: null,
        total: 3,
        ids: [ids],
        items,
      });
    });

    it('should show and hide the loading indicator', () => {
      apiService.getStoryIds.mockReturnValue(of([1]));
      apiService.getStory.mockReturnValue(of(createItem(1)));

      service.load();

      expect(loadingService.show).toHaveBeenCalledOnce();
      expect(loadingService.hide).toHaveBeenCalledOnce();
    });

    it('should only load the requested chunk', () => {
      const ids = Array.from({ length: 250 }, (_, i) => i + 1);

      apiService.getStoryIds.mockReturnValue(of(ids));
      apiService.getStory.mockImplementation((id: number) => of(createItem(id)));

      service.load(2);

      expect(apiService.getStoryIds).toHaveBeenCalledOnce();

      // Chunk 2 = ids 101-200
      expect(apiService.getStory).toHaveBeenCalledTimes(100);
      expect(apiService.getStory).toHaveBeenCalledWith(101);
      expect(apiService.getStory).toHaveBeenCalledWith(200);

      expect(apiService.getStory).not.toHaveBeenCalledWith(1);
      expect(apiService.getStory).not.toHaveBeenCalledWith(201);

      expect(service.response()?.items).toHaveLength(100);
    });

    it('should load all chunks when page is "all"', () => {
      const ids = Array.from({ length: 250 }, (_, i) => i + 1);

      apiService.getStoryIds.mockReturnValue(of(ids));
      apiService.getStory.mockImplementation((id: number) => of(createItem(id)));

      service.load('all');

      expect(apiService.getStoryIds).toHaveBeenCalledOnce();
      expect(apiService.getStory).toHaveBeenCalledTimes(250);
      expect(service.response()?.items).toHaveLength(250);
    });

    it('should not reload already loaded stories', () => {
      const ids = [1, 2, 3];

      apiService.getStoryIds.mockReturnValue(of(ids));
      apiService.getStory.mockImplementation((id: number) => of(createItem(id)));

      service.load();
      service.load();

      expect(apiService.getStoryIds).toHaveBeenCalledOnce();

      // The second load should not request the stories again.
      expect(apiService.getStory).toHaveBeenCalledTimes(3);
      expect(service.response()?.items).toHaveLength(3);
    });

    it('should handle an empty story-id response', () => {
      apiService.getStoryIds.mockReturnValue(of([]));

      service.load();

      expect(apiService.getStoryIds).toHaveBeenCalledOnce();
      expect(apiService.getStory).not.toHaveBeenCalled();

      expect(service.response()).toEqual({
        page: 1,
        nextPage: null,
        total: 0,
        ids: [],
        items: [],
      });

      expect(service.visibleItems()).toEqual([]);
    });
  });

  describe('setStoryType', () => {
    it('should do nothing when the story type is unchanged', () => {
      service.setStoryType('topstories');

      expect(apiService.getStoryIds).not.toHaveBeenCalled();
      expect(loadingService.show).not.toHaveBeenCalled();
      expect(service.storyType()).toBe('topstories');
      expect(service.response()).toBeNull();
      expect(service.pageIndex()).toBe(0);
    });

    it('should reset state and load when the story type changes', () => {
      apiService.getStoryIds.mockReturnValue(of([10, 20]));
      apiService.getStory.mockImplementation((id: number) => of(createItem(id)));

      service.setStoryType('newstories');

      expect(service.storyType()).toBe('newstories');
      expect(service.pageIndex()).toBe(0);

      expect(apiService.getStoryIds).toHaveBeenCalledOnce();
      expect(apiService.getStoryIds).toHaveBeenCalledWith('newstories');

      expect(service.response()?.items).toEqual([createItem(10), createItem(20)]);
    });

    it('should clear previously loaded response when changing story type', () => {
      apiService.getStoryIds.mockReturnValueOnce(of([1, 2])).mockReturnValueOnce(of([3, 4]));

      apiService.getStory.mockImplementation((id: number) => of(createItem(id)));

      service.load();

      expect(service.response()?.items).toHaveLength(2);

      service.setStoryType('beststories');

      expect(service.storyType()).toBe('beststories');
      expect(service.response()?.items).toEqual([createItem(3), createItem(4)]);
    });
  });

  describe('visibleItems', () => {
    it('should return an empty array when there is no response', () => {
      expect(service.visibleItems()).toEqual([]);
    });

    it('should return items for the current page', () => {
      const items = Array.from({ length: 30 }, (_, i) => createItem(i + 1));

      const response: NewsResponse = {
        page: 1,
        nextPage: null,
        total: 30,
        ids: [items.map((item) => item.id)],
        items,
      };

      service.response.set(response);

      expect(service.visibleItems()).toHaveLength(25);
      expect(service.visibleItems()[0].id).toBe(1);
      expect(service.visibleItems()[24].id).toBe(25);

      service.pageIndex.set(1);

      expect(service.visibleItems()).toHaveLength(5);
      expect(service.visibleItems()[0].id).toBe(26);
      expect(service.visibleItems()[4].id).toBe(30);
    });

    it('should not mutate the original items when sorting', () => {
      const items = [createItem(3), createItem(1), createItem(2)];

      service.response.set({
        page: 1,
        nextPage: null,
        total: 3,
        ids: [[1, 2, 3]],
        items,
      });

      service.onSortChange({
        active: 'score',
        direction: 'asc',
      });

      expect(service.visibleItems().map((item) => item.id)).toEqual([1, 2, 3]);

      expect(service.response()?.items.map((item) => item.id)).toEqual([3, 1, 2]);
    });
  });

  describe('onPageChange', () => {
    beforeEach(() => {
      const ids = Array.from({ length: 250 }, (_, i) => i + 1);

      service.response.set({
        page: 1,
        nextPage: 2,
        total: 250,
        ids: [ids.slice(0, 100), ids.slice(100, 200), ids.slice(200, 250)],
        items: [],
      });

      apiService.getStory.mockImplementation((id: number) => of(createItem(id)));
    });

    it('should update page index and page size', () => {
      service.onPageChange({
        pageIndex: 1,
        pageSize: 10,
        length: 250,
      } as PageEvent);

      expect(service.pageIndex()).toBe(1);
      expect(service.pageSize()).toBe(10);
    });

    it('should do nothing when there is no response', () => {
      service.response.set(null);

      service.onPageChange({
        pageIndex: 1,
        pageSize: 10,
        length: 0,
      });

      expect(apiService.getStory).not.toHaveBeenCalled();
    });

    it('should load the required chunk for a non-last page', () => {
      service.onPageChange({
        pageIndex: 1,
        pageSize: 25,
        length: 250,
      });

      expect(apiService.getStory).toHaveBeenCalledTimes(100);

      expect(apiService.getStory).toHaveBeenCalledWith(1);
      expect(apiService.getStory).toHaveBeenCalledWith(100);
    });

    it('should load the next chunk when the page crosses a chunk boundary', () => {
      service.onPageChange({
        pageIndex: 4,
        pageSize: 25,
        length: 250,
      });

      expect(apiService.getStory).toHaveBeenCalledTimes(100);

      expect(apiService.getStory).toHaveBeenCalledWith(101);
      expect(apiService.getStory).toHaveBeenCalledWith(200);
    });

    it('should load all stories on the last page', () => {
      service.onPageChange({
        pageIndex: 9,
        pageSize: 25,
        length: 250,
      });

      expect(apiService.getStory).toHaveBeenCalledTimes(250);
    });
  });

  describe('onSortChange', () => {
    it('should update the sort values', () => {
      const sort: Sort = {
        active: 'title',
        direction: 'desc',
      };

      service.onSortChange(sort);

      expect(service.sortValues()).toEqual(sort);
    });

    it('should sort ascending', () => {
      const items = [
        createItem(3, { title: 'Charlie' }),
        createItem(1, { title: 'Alpha' }),
        createItem(2, { title: 'Bravo' }),
      ];

      service.response.set({
        page: 1,
        nextPage: null,
        total: 3,
        ids: [[1, 2, 3]],
        items,
      });

      service.onSortChange({
        active: 'title',
        direction: 'asc',
      });

      expect(service.visibleItems().map((item) => item.title)).toEqual([
        'Alpha',
        'Bravo',
        'Charlie',
      ]);
    });

    it('should sort descending', () => {
      const items = [
        createItem(3, { title: 'Charlie' }),
        createItem(1, { title: 'Alpha' }),
        createItem(2, { title: 'Bravo' }),
      ];

      service.response.set({
        page: 1,
        nextPage: null,
        total: 3,
        ids: [[1, 2, 3]],
        items,
      });

      service.onSortChange({
        active: 'title',
        direction: 'desc',
      });

      expect(service.visibleItems().map((item) => item.title)).toEqual([
        'Charlie',
        'Bravo',
        'Alpha',
      ]);
    });

    it('should return items unchanged when sort direction is empty', () => {
      const items = [createItem(3), createItem(1), createItem(2)];

      service.response.set({
        page: 1,
        nextPage: null,
        total: 3,
        ids: [[1, 2, 3]],
        items,
      });

      service.onSortChange({
        active: 'score',
        direction: '',
      });

      expect(service.visibleItems().map((item) => item.id)).toEqual([3, 1, 2]);
    });

    it('should sort numeric values numerically', () => {
      const items = [createItem(10), createItem(2), createItem(100)];

      service.response.set({
        page: 1,
        nextPage: null,
        total: 3,
        ids: [[10, 2, 100]],
        items,
      });

      service.onSortChange({
        active: 'score',
        direction: 'asc',
      });

      expect(service.visibleItems().map((item) => item.score)).toEqual([2, 10, 100]);
    });
  });

  describe('pagination and sorting together', () => {
    it('should sort before applying pagination', () => {
      const items = Array.from({ length: 30 }, (_, i) => createItem(30 - i));

      service.response.set({
        page: 1,
        nextPage: null,
        total: 30,
        ids: [items.map((item) => item.id)],
        items,
      });

      service.pageSize.set(10);
      service.pageIndex.set(1);

      service.onSortChange({
        active: 'score',
        direction: 'asc',
      });

      expect(service.visibleItems().map((item) => item.score)).toEqual([
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]);
    });
  });
});
