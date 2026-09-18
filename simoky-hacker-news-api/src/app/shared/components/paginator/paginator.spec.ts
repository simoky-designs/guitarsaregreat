import '@angular/compiler';
import { PageEvent } from '@angular/material/paginator';
import { describe, expect, it } from 'vitest';
import { Paginator } from './paginator';

describe('Paginator', () => {
  it('should create with reusable defaults', () => {
    const component = new Paginator();

    expect(component).toBeTruthy();
    expect(component.pageSize).toBe(30);
    expect(component.pageSizeOptions).toEqual([10, 30, 65, 100]);
  });

  it('should emit page changes', () => {
    const component = new Paginator();
    const pageEvent = { pageIndex: 1, pageSize: 30, length: 100 } as PageEvent;
    let emittedEvent: PageEvent | undefined;

    component.page.subscribe((event) => (emittedEvent = event));
    component.page.emit(pageEvent);

    expect(emittedEvent).toBe(pageEvent);
  });
});
