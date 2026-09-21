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

@Component({
  imports: [NgTemplateOutlet, MatButtonModule, MatIconModule, MatSortModule, MatTableModule],
  selector: 'app-table',
  styleUrl: './table.scss',
  templateUrl: './table.html',
  standalone: true,
})
export class Table<T extends object> implements OnChanges {
  @Input() dataSource = new MatTableDataSource<T>([]);
  @Input() columns: Record<string, string> = {};
  @Input() sortActive = '';
  @Input() sortDirection: SortDirection = '';
  @Input() detailTemplate?: TemplateRef<unknown>;
  @Output() rowToggled = new EventEmitter<unknown>();
  @Output() sortChange = new EventEmitter<Sort>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<T>;
  expandedElements = new Set<T>();

  get columnEntries(): { key: string; label: string }[] {
    return Object.entries(this.columns).map(([label, key]) => ({ key, label }));
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
