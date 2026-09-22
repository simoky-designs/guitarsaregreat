import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { NewsItem } from '../../core/interfaces/news';
import { LoadingService } from '../../core/services/loading-service';
import { Paginator } from '../../shared/components/paginator/paginator';
import { Table } from '../../shared/components/table/table';
import { NewsQueryService } from '../../core/services/news-query-service';
import {
  EXPANDED_COLUMNS,
  TABLE_COLUMNS,
  NO_DATA_MESSAGE,
  APP_NAME,
} from '../../shared/const/app-constants';

@Component({
  imports: [Paginator, Table],
  selector: 'app-news-dashboard',
  styleUrl: './news-dashboard.scss',
  templateUrl: './news-dashboard.html',
  standalone: true,
})
export class NewsDashboard implements OnInit {
  readonly queryService = inject(NewsQueryService);
  readonly loadingService = inject(LoadingService);
  readonly columnsToDisplay = TABLE_COLUMNS;
  readonly expandedFields = EXPANDED_COLUMNS;
  readonly noDataMessage = NO_DATA_MESSAGE;
  title = signal(APP_NAME);
  showFirstLastButtons = signal(false);
  dataSource = new MatTableDataSource<NewsItem>([]);
  pageSizeOptions = this.queryService.pageSizeOptions();
  pageIndex = this.queryService.pageIndex;
  pageSize = this.queryService.pageSize;

  private readonly visibleItemsEffect = effect(() => {
    this.dataSource.data = this.queryService.visibleItems();
  });

  ngOnInit() {
    this.queryService.load(1);
  }

  onPageChange(event: PageEvent): void {
    this.queryService.onPageChange(event);
    this.dataSource.data = this.queryService.visibleItems();
  }

  onSortChange(sort: Sort): void {
    this.queryService.onSortChange(sort);
    this.dataSource.data = this.queryService.visibleItems();
  }

}

