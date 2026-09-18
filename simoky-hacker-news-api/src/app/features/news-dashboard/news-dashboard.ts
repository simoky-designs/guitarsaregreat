import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
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
import { LoadingService } from '../../core/services/loading-service';

@Component({
  imports: [MatPaginatorModule, MatSortModule, MatTableModule, MatButtonModule, MatIconModule],
  selector: 'app-news-dashboard',
  styleUrl: './news-dashboard.scss',
  templateUrl: './news-dashboard.html',
  standalone: true,
})
export class NewsDashboard implements OnInit {
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;
  title = signal('Hacker News');
  readonly loadingService = inject(LoadingService);

  ngOnInit() {
    this.loadNews(1);
  }

  private readonly newsService = inject(ApiService);

  readonly news = signal<NewsResponse | null>(null);
  readonly error = signal<string | null>(null);

  dataSource = new MatTableDataSource<NewsItem>([]);
  columnsToDisplay = ['id', 'rank', 'title'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: NewsItem | null = null;

  isExpanded(element: NewsItem): boolean {
    return this.expandedElement === element;
  }

  toggle(element: NewsItem) {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

  loadNews(page = 1): void {
    this.loadingService.show();
    this.error.set(null);

    this.newsService.getNews(page).subscribe({
      next: (response) => {
        this.news.set(response);
        this.dataSource.data = response.items;
        this.loadingService.hide();
      },
      error: () => {
        this.error.set('Failed to load news');
        this.loadingService.hide();
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
