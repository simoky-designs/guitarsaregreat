import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../core/services/api-service';
import { NewsItem, NewsResponse } from '../../core/interfaces/news';
import { LoadingService } from '../../core/services/loading-service';
import { PostedAtDatePipe } from '../../shared/pipes/date.pipe';
import { Paginator } from '../../shared/components/paginator/paginator';
import { Table } from '../../shared/components/table/table';
import { Subject, takeUntil } from 'rxjs';

@Component({
  imports: [PostedAtDatePipe, Paginator, Table],
  selector: 'app-news-dashboard',
  styleUrl: './news-dashboard.scss',
  templateUrl: './news-dashboard.html',
  standalone: true,
})
export class NewsDashboard implements OnInit, OnDestroy {
  private readonly newsService = inject(ApiService);
  readonly loadingService = inject(LoadingService);
  readonly news = signal<NewsResponse | null>(null);
  readonly error = signal<string | null>(null);
  dataSource = new MatTableDataSource<NewsItem>([]);
  columnsToDisplay = ['title', 'author', 'rank'];
  title = signal('Hacker News');
  private readonly onDestroy$ = new Subject<void>();
  private allItems: NewsItem[] = [];
  pageIndex = 0;
  pageSize = 30;

  ngOnInit() {
    this.loadNews(1);
  }

  loadNews(page = 1): void {
    this.loadingService.show();
    this.error.set(null);

    this.newsService
      .getNews(page)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: (response) => {
          this.news.set(response);
          this.allItems = response.items;
          this.dataSource = new MatTableDataSource(response.items);
          this.loadingService.hide();
        },
        error: () => {
          this.error.set('Failed to load news');
          this.loadingService.hide();
        },
      });
  }

  onPageChange({ pageIndex, pageSize }: PageEvent): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.loadNews(pageIndex + 1);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}

