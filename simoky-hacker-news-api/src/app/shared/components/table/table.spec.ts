import '@angular/compiler';
import { MatTableDataSource } from '@angular/material/table';
import { describe, expect, it } from 'vitest';
import { Table } from './table';

describe('Table', () => {
  it('should create with reusable defaults', () => {
    const component = new Table();

    expect(component).toBeTruthy();
    expect(component.columns).toEqual([]);
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
  });

  it('should expose columns with an expand column', () => {
    const component = new Table();
    component.columns = [
      { key: 'title', label: 'Title' },
      { key: 'by', label: 'Author' },
    ];

    expect(component.columnsWithExpand).toEqual(['title', 'by', 'expand']);
    expect(component.columnEntries).toEqual([
      { key: 'title', label: 'Title' },
      { key: 'by', label: 'Author' },
    ]);
  });

  it('should toggle and emit the expanded row', () => {
    const component = new Table();
    const row = { id: 1 };
    let emittedRow: unknown;

    component.rowToggled.subscribe((value) => (emittedRow = value));
    component.toggle(row);

    expect(component.expandedElements.has(row)).toBe(true);
    expect(emittedRow).toBe(row);

    component.toggle(row);
    expect(component.expandedElements.has(row)).toBe(false);
  });
});
