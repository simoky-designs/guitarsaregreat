import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'postedAtDate',
  standalone: true,
})
export class PostedAtDatePipe implements PipeTransform {
  private readonly datePipe = new DatePipe('en-US');

  transform(
    value: number | string | null | undefined,
    format = 'mediumDate',
  ): string {
    if (value == null || value === '') {
      return '-';
    }

    const timestamp = Number(value);

    if (Number.isNaN(timestamp)) {
      return '-';
    }
    return this.datePipe.transform(timestamp * 1000, format) ?? '-';
  }
}