import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
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
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  imports: [NgTemplateOutlet, MatButtonModule, MatIconModule, MatSortModule, MatTableModule],
  selector: 'app-table',
  styleUrl: './table.scss',
  templateUrl: './table.html',
  standalone: true,
})
export class Table<T extends object> implements AfterViewInit, OnChanges {
  @Input() dataSource = new MatTableDataSource<T>([]);
  @Input() columns: string[] = [];
  @Input() detailTemplate?: TemplateRef<unknown>;
  @Output() rowToggled = new EventEmitter<unknown>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<T>;
  expandedElements = new Set<T>();
 
  get columnsWithExpand(): string[] {
    return [...this.columns, 'expand'];
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    this.table?.renderRows();
  }

  toggle(element: T): void {
    if (this.expandedElements.has(element)) {
      this.expandedElements.delete(element);
    } else {
      this.expandedElements.add(element);
    }
  }

  isExpanded(element: T): boolean {
    return this.expandedElements.has(element);
  }
}
