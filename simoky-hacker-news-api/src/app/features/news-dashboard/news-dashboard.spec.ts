import '@angular/compiler';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NewsItem, NewsResponse } from '../../core/interfaces/news';
import { NewsQueryService } from '../../core/services/news-query-service';
import { LoadingService } from '../../core/services/loading-service';
import {
  APP_NAME,
  EXPANDED_COLUMNS,
  TABLE_COLUMNS,
  NO_DATA_MESSAGE,
} from '../../shared/const/app-const';
import { NewsDashboard } from './news-dashboard';

describe('NewsDashboard', () => {
  let component: NewsDashboard;
  let fixture: ComponentFixture<NewsDashboard>;

  const visibleItems = [
    {
      id: 1,
      type: 'story',
      time: 1234567890,
      score: 10,
      title: 'Story 1',
      by: 'tester',
    },
    {
      id: 2,
      type: 'story',
      time: 1234567891,
      score: 20,
      title: 'Story 2',
      by: 'tester',
    },
  ] satisfies NewsItem[];

 let queryService: {
  pageSizeOptions: ReturnType<typeof vi.fn>;
  pageIndex: ReturnType<typeof signal<number>>;
  pageSize: ReturnType<typeof signal<number>>;
  loading: ReturnType<typeof signal<boolean>>;
  response: ReturnType<typeof signal<NewsResponse | null>>;
  visibleItems: ReturnType<typeof signal<NewsItem[]>>;
  load: ReturnType<typeof vi.fn>;
  onPageChange: ReturnType<typeof vi.fn>;
  onSortChange: ReturnType<typeof vi.fn>;
};

  beforeEach(async () => {
    queryService = {
      pageSizeOptions: vi.fn(() => [10, 25, 50]),
      pageIndex: signal(0),
      pageSize: signal(25),
      loading: signal(false),
      response: signal<NewsResponse | null>(null),      
      visibleItems: signal(visibleItems),
      load: vi.fn(),
      onPageChange: vi.fn(),
      onSortChange: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NewsDashboard],
      providers: [
        {
          provide: NewsQueryService,
          useValue: queryService,
        },
        {
          provide: LoadingService,
          useValue: {
            isLoading: signal(false),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewsDashboard);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should use the application name as the title', () => {
      expect(component.title()).toBe(APP_NAME);
    });

    it('should show first and last paginator buttons by default', () => {
      expect(component.showFirstLastButtons()).toBe(true);
    });

    it('should use the configured table columns', () => {
      expect(component.columnsToDisplay).toEqual(TABLE_COLUMNS);
    });

    it('should use the configured expanded fields', () => {
      expect(component.expandedFields).toEqual(EXPANDED_COLUMNS);
    });

    it('should use the configured no-data message', () => {
      expect(component.noDataMessage).toBe(NO_DATA_MESSAGE);
    });

    it('should get page size options from the query service', () => {
      expect(component.pageSizeOptions).toEqual([10, 25, 50]);
      expect(queryService.pageSizeOptions).toHaveBeenCalled();
    });

    it('should expose the page index signal from the query service', () => {
      expect(component.pageIndex).toBe(queryService.pageIndex);
    });

    it('should expose the page size signal from the query service', () => {
      expect(component.pageSize).toBe(queryService.pageSize);
    });
  });

  describe('ngOnInit', () => {
    it('should load the first page', () => {
      expect(queryService.load).toHaveBeenCalledWith(1);
    });
  });

  describe('visible items effect', () => {
    it('should populate the data source with visible items', () => {
      expect(component.dataSource.data).toEqual(visibleItems);
    });

    it('should update the data source when visible items change', () => {
      const newItems: NewsItem[] = [
        {
          id: 3,
          type: 'story',
          time: 1234567892,
          title: 'Third story',
          by: 'tester',
          score: 30,
        },
      ];

      queryService.visibleItems.set(newItems);

      fixture.detectChanges();

      expect(component.dataSource.data).toEqual(newItems);
    });
  });

  describe('onPageChange', () => {
    it('should delegate the page event to the query service', () => {
      const event: PageEvent = {
        pageIndex: 1,
        pageSize: 25,
        length: 100,
      };

      component.onPageChange(event);

      expect(queryService.onPageChange).toHaveBeenCalledWith(event);
    });
  });

  describe('onSortChange', () => {
    it('should delegate the sort event to the query service', () => {
      const sort: Sort = {
        active: 'score',
        direction: 'desc',
      };

      component.onSortChange(sort);

      expect(queryService.onSortChange).toHaveBeenCalledWith(sort);
    });
  });
});
