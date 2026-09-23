import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { NewsItem, NewsResponse } from '../interfaces/news';
import { ApiService } from './api-service';
import { LoadingService } from './loading-service';
import { StoryType } from '../../shared/types/componet-types';
@Injectable({ providedIn: 'root' })
export class NewsQueryService {
  readonly response = signal<NewsResponse | null>(null);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(ApiService);
  readonly loading = this.loadingService.isLoading;
  readonly pageSizeOptions = signal([10, 25, 50]);
  readonly pageSize = signal(25);
  readonly pageIndex = signal(0);
  readonly storyType = signal<StoryType>('topstories');
  readonly sortValues = signal<Sort>({ active: 'score', direction: 'asc' });
  private readonly pageChunkSize = 100;
  private readonly loadedIds = signal<number[]>([]);

  readonly visibleItems = computed<NewsItem[]>(() => {
    const response = this.response();
    if (!response) {
      return [];
    }
    const items = this.sortItems(response.items);
    const start = this.pageIndex() * this.pageSize();
    return items.slice(start, start + this.pageSize());
  });

  setStoryType(storyType: StoryType): void {
    if (this.storyType() === storyType) {
      return;
    }
    this.storyType.set(storyType);
    this.response.set(null);
    this.loadedIds.set([]);
    this.pageIndex.set(0);
    this.load();
  }

  load(page: number | 'all' = 1): void {
    this.loadingService.show();
    this.getStoryIds()
      .pipe(
        switchMap((ids) => {
          const idsToLoad = page === 'all' ? ids.flat() : (ids[page - 1] ?? []);
          return this.getStories(idsToLoad);
        }),
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((items) => {
        this.appendItems(items);
      });
  }
 
  private getStoryIds(): Observable<number[][]> {
    const ids = this.response()?.ids;
    if (ids) {
      return of(ids);
    }
    return this.apiService.getStoryIds(this.storyType()).pipe(
      map((ids) => this.chunkIds(ids)),
      map((chunks) => {
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

  private getStories(ids: number[]): Observable<NewsItem[]> {
    const loaded = this.loadedIds();
    const unloadedIds = ids.filter((id) => !loaded.includes(id));
    if (!unloadedIds.length) {
      return of([]);
    }
    return forkJoin(unloadedIds.map((id) => this.apiService.getStory(id)));
  }

  private appendItems(items: NewsItem[]): void {
    if (!items.length) {
      return;
    }
    this.response.update((response) =>
      response ? { ...response, items: [...response.items, ...items] } : response,
    );
    this.loadedIds.update((ids) => [...ids, ...items.map((item) => item.id)]);
  }

  onPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);
    const response = this.response();
    if (!response?.ids) {
      return;
    }
    const totalPages = Math.ceil(response.total / pageSize);
    const isLastPage = pageIndex === totalPages - 1;
    if (isLastPage) {
      this.load('all');
      return;
    }
    const requiredChunk = Math.floor((pageIndex * pageSize) / this.pageChunkSize);
    this.load(requiredChunk + 1);
  }

  onSortChange(sort: Sort): void {
    this.sortValues.set(sort);
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
        String(valueA ?? '').localeCompare(String(valueB ?? ''), 'en', {
          numeric: true,
          sensitivity: 'base',
        }) * direction
      );
    });
  }
}
