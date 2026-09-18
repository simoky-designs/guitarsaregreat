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
    component.columns = ['title', 'author'];

    expect(component.columnsWithExpand).toEqual(['title', 'author', 'expand']);
  });

  it('should toggle and emit the expanded row', () => {
    const component = new Table();
    const row = { id: 1 };
    let emittedRow: unknown;

    component.rowToggled.subscribe((value) => (emittedRow = value));
    component.toggle(row);

    expect(component.expandedElement).toBe(row);
    expect(emittedRow).toBe(row);

    component.toggle(row);
    expect(component.expandedElement).toBeNull();
  });
});
