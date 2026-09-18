import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../core/services/api-service';
import { NewsItem, NewsResponse } from '../../core/interfaces/news';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [JsonPipe, MatPaginatorModule, MatSortModule, MatTableModule, MatButtonModule, MatIconModule],
  selector: 'app-news-dashboard',
  styleUrl: './news-dashboard.scss',
  templateUrl: './news-dashboard.html',
})
export class NewsDashboard implements OnInit {
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;
  title = signal('Simoky Hacker News');

  ngOnInit() {
    this.loadNews(1);
  }

  private readonly newsService = inject(ApiService);

  readonly news = signal<NewsResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  dataSource = new MatTableDataSource<NewsItem>([]);
  columnsToDisplay = ['id', 'rank', 'title'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: NewsItem | null = null;

  /** Checks whether an element is expanded. */
  isExpanded(element: NewsItem): boolean {
    return this.expandedElement === element;
  }

  /** Toggles the expanded state of an element. */
  toggle(element: NewsItem) {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

  loadNews(page = 1): void {
    this.loading.set(true);
    this.error.set(null);

    this.newsService.getNews(page).subscribe({
      next: (response) => {
        this.news.set(response);
        this.dataSource.data = response.items;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load news');
        this.loading.set(false);
      },
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onPageChange(event: PageEvent): void {
    console.log('Page:', event.pageIndex + 1);
  }
}
