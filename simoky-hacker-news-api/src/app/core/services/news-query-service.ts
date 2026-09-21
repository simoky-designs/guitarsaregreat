import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, forkJoin, map, shareReplay, switchMap } from 'rxjs';
import { NewsItem, NewsResponse } from '../interfaces/news';
import { ApiService } from './api-service';
import { LoadingService } from './loading-service';

@Injectable({
  providedIn: 'root',
})
export class NewsQueryService {
  readonly response = signal<NewsResponse | null>(null);
  readonly error = signal<string | null>(null);
  private readonly loadingService = inject(LoadingService);
  readonly loading = this.loadingService.isLoading;

  readonly pageSizeOptions = signal([10, 25, 50]);
  readonly pageSize = signal(25);
  readonly pageIndex = signal(0);
  readonly storyType = signal<'top' | 'new' | 'best'>('top');

  readonly sort = signal<Sort>({
    active: 'score',
    direction: 'asc',
  });

  private readonly pageChunkSize = 100;
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(ApiService);
  private loadedChunk = signal(0);
  private storyIds$ = this.createStoryIdsStream();

  readonly visibleItems = computed<NewsItem[]>(() => {
    const response = this.response();

    if (!response) {
      return [];
    }

    const items = this.sortItems(response.items);
    const start = this.pageIndex() * this.pageSize();

    return items.slice(start, start + this.pageSize());
  });

  setStoryType(storyType: 'top' | 'new' | 'best'): void {
    if (this.storyType() === storyType) {
      return;
    }

    this.storyType.set(storyType);
    this.response.set(null);
    this.loadedChunk.set(0);
    this.pageIndex.set(0);
    this.storyIds$ = this.createStoryIdsStream();
    this.load();
  }

  private createStoryIdsStream() {
    return defer(() => this.apiService.getStoryIds(this.storyType())).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  load(page = 1): void {
    this.loadingService.show();
    this.error.set(null);

    this.storyIds$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((ids) => this.loadChunk(page, ids)),
      )
      .subscribe({
        next: (response) => {
          const previousItems = this.response()?.items ?? [];

          this.response.set({
            ...response,
            items: [...previousItems, ...response.items],
          });

          this.loadedChunk.set(page);
        },
        error: () => {
          this.error.set('Failed to load news');
          this.loadingService.hide();
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  }

  private loadChunk(page: number, ids: number[]) {
    const start = (page - 1) * this.pageChunkSize;
    const end = start + this.pageChunkSize;
    const pageIds = ids.slice(start, end);

    return forkJoin(pageIds.map((id) => this.apiService.getStory(id))).pipe(
      map(
        (items) =>
          ({
            page,
            nextPage: end < ids.length ? page + 1 : null,
            total: ids.length,
            items,
          }) satisfies NewsResponse,
      ),
    );
  }

  onPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);

    const requiredChunk = Math.floor((pageIndex * pageSize) / this.pageChunkSize) + 1;

    if (requiredChunk > this.loadedChunk()) {
      this.load(requiredChunk);
    }
  }

  /**
   * Handle table sorting.
   */
  onSortChange(sort: Sort): void {
    this.sort.set(sort);
  }

  /**
   * Sort the items currently held in the API window.
   */
  private sortItems(items: NewsItem[]): NewsItem[] {
    const sort = this.sort();

    if (!sort.active || !sort.direction) {
      return items;
    }

    const direction = sort.direction === 'asc' ? 1 : -1;

    return [...items].sort((left, right) => {
      const leftValue = left[sort.active as keyof NewsItem];

      const rightValue = right[sort.active as keyof NewsItem];

      return (
        String(leftValue ?? '').localeCompare(String(rightValue ?? ''), undefined, {
          numeric: true,
          sensitivity: 'base',
        }) * direction
      );
    });
  }
}
