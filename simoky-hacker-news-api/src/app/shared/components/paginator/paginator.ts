import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  imports: [MatPaginatorModule],
  selector: 'app-paginator',
  styleUrl: './paginator.scss',
  templateUrl: './paginator.html',
  standalone: true,
})
export class Paginator {
  @Input() length = 0;
  @Input() pageSize = 30;
  @Input() pageIndex = 0;
  @Input() hidePageSize = false;
  @Input() showFirstLastButtons = false;
  @Input() pageSizeOptions: number[] = [10, 30, 60];
  @Input() ariaLabel = 'Select page';
  @Output() pageChange = new EventEmitter<PageEvent>();
}
