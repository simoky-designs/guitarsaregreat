import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  finalize,
  forkJoin,
  map,
  Observable,
  switchMap,
} from 'rxjs';

import { NewsItem, NewsResponse } from '../interfaces/news';
import { ApiService } from './api-service';
import { LoadingService } from './loading-service';
import { StoryTypes } from '../../shared/types/componet-types';

@Injectable({
  providedIn: 'root',
})
export class NewsQueryService {
  readonly response = signal<NewsResponse | null>(null);

  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(ApiService);

  readonly loading = this.loadingService.isLoading;

  readonly pageSizeOptions = signal([10, 25, 50]);
  readonly pageSize = signal(25);
  readonly pageIndex = signal(0);
  readonly storyType = signal<StoryTypes>('topstories');

  readonly sortValues = signal<Sort>({
    active: 'score',
    direction: 'asc',
  });

  private readonly pageChunkSize = 100;

  /**
   * Story IDs whose details have already been loaded.
   */
  private readonly loadedIds = signal<Set<number>>(new Set());

  readonly visibleItems = computed<NewsItem[]>(() => {
    const response = this.response();

    if (!response) {
      return [];
    }

    const items = this.sortItems(response.items);
    const start = this.pageIndex() * this.pageSize();

    return items.slice(start, start + this.pageSize());
  });

  setStoryType(storyType: StoryTypes): void {
    if (this.storyType() === storyType) {
      return;
    }

    this.storyType.set(storyType);
    this.response.set(null);
    this.loadedIds.set(new Set());
    this.pageIndex.set(0);

    this.load();
  }

  /**
   * Initial load / load a specific 100-ID chunk.
   */
  load(page = 1): void {
    this.loadingService.show();

    this.getStoryIds()
      .pipe(
        switchMap((ids) => this.getBatchStories(page, ids)),
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((items) => {
        this.appendItems(items);
      });
  }

  /**
   * Fetch the complete list of story IDs.
   */
  private getStoryIds(): Observable<number[][]> {
    const ids = this.response()?.ids;

    if (ids) {
      return new Observable((subscriber) => {
        subscriber.next(ids);
        subscriber.complete();
      });
    }

    return this.apiService.getStoryIds(this.storyType()).pipe(
      map((ids) => this.chunkIds(ids)),
      map((chunks) => {
        // Store ALL IDs immediately.
        this.response.set({
          page: 1,
          nextPage: chunks.length > 1 ? 2 : null,
          total: chunks.flat().length,
          ids: chunks,
          items: [],
        });

        return chunks;
      }),
      takeUntilDestroyed(this.destroyRef),
    );
  }

  private chunkIds(ids: number[]): number[][] {
    const chunks: number[][] = [];

    for (let i = 0; i < ids.length; i += this.pageChunkSize) {
      chunks.push(ids.slice(i, i + this.pageChunkSize));
    }

    return chunks;
  }

  /**
   * Loads stories for a specific chunk.
   *
   * Already-loaded IDs are ignored.
   */
  private getBatchStories(
    page: number,
    ids: number[][],
  ): Observable<NewsItem[]> {
    const pageIds = ids[page - 1] ?? [];
    const loaded = this.loadedIds();

    const unloadedIds = pageIds.filter(
      (id) => !loaded.has(id),
    );

    if (!unloadedIds.length) {
      return new Observable((subscriber) => {
        subscriber.next([]);
        subscriber.complete();
      });
    }

    return forkJoin(
      unloadedIds.map((id) => this.apiService.getStory(id)),
    );
  }

  /**
   * Append newly loaded stories and remember their IDs.
   */
  private appendItems(items: NewsItem[]): void {
    if (!items.length) {
      return;
    }

    this.response.update((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: [...current.items, ...items],
      };
    });

    this.loadedIds.update((current) => {
      const next = new Set(current);

      items.forEach((item) => {
        next.add(item.id);
      });

      return next;
    });
  }

  onPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);

    const response = this.response();

    if (!response?.ids) {
      return;
    }

    const totalPages = Math.ceil(
      response.total / pageSize,
    );

    const isLastPage = pageIndex === totalPages - 1;

    if (isLastPage) {
      // Material "Last" button:
      // fetch every story that isn't loaded yet.
      this.loadAll();
      return;
    }

    const requiredChunk =
      Math.floor((pageIndex * pageSize) / this.pageChunkSize);

    this.load(requiredChunk + 1);
  }

  /**
   * Load every story ID that hasn't been loaded yet.
   */
  private loadAll(): void {
    const ids = this.response()?.ids;

    if (!ids) {
      return;
    }

    const loaded = this.loadedIds();

    const unloadedIds = ids
      .flat()
      .filter((id) => !loaded.has(id));

    if (!unloadedIds.length) {
      return;
    }

    this.loadingService.show();

    forkJoin(
      unloadedIds.map((id) => this.apiService.getStory(id)),
    )
      .pipe(
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((items) => {
        this.appendItems(items);
      });
  }

  onSortChange(sortValues: Sort): void {
    this.sortValues.set(sortValues);
  }

  private sortItems(items: NewsItem[]): NewsItem[] {
    const sort = this.sortValues();

    if (!sort.active || !sort.direction) {
      return items;
    }

    const direction = sort.direction === 'asc' ? 1 : -1;

    return [...items].sort((a, b) => {
      const valueA = a[sort.active as keyof NewsItem];
      const valueB = b[sort.active as keyof NewsItem];

      return (
        String(valueA ?? '').localeCompare(
          String(valueB ?? ''),
          'en',
          {
            numeric: true,
            sensitivity: 'base',
          },
        ) * direction
      );
    });
  }
}