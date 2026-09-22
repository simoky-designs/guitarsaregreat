import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TABLE_ARIA_LABELS } from '../../const/app-constants';
import { PostedAtDatePipe } from '../../pipes/date.pipe';
import { TableColumn } from '../../types/componet-types';

@Component({
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    PostedAtDatePipe,
  ],
  selector: 'app-table',
  styleUrl: './table.scss',
  templateUrl: './table.html',
  standalone: true,
})
export class Table<T extends object> implements OnChanges {
  @Input() dataSource = new MatTableDataSource<T>([]);
  @Input() columns: readonly TableColumn[] = [];
  @Input() sortActive = '';
  @Input() sortDirection: SortDirection = '';
  @Input() detailTemplate?: TemplateRef<unknown>;
  @Output() rowToggled = new EventEmitter<unknown>();
  @Output() sortChange = new EventEmitter<Sort>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<T>;
  expandedElements = new Set<T>();
  readonly tableAriaLabels = TABLE_ARIA_LABELS;

  get columnEntries(): TableColumn[] {
    return [...this.columns];
  }

  get columnsWithExpand(): string[] {
    return [...this.columnEntries.map(({ key }) => key), 'expand'];
  }

  ngOnChanges(): void {
    this.table?.renderRows();
  }

  toggle(element: T): void {
    if (this.expandedElements.has(element)) {
      this.expandedElements.delete(element);
    } else {
      this.expandedElements.add(element);
    }
    this.rowToggled.emit(element);
  }

  isExpanded(element: T): boolean {
    return this.expandedElements.has(element);
  }
}
