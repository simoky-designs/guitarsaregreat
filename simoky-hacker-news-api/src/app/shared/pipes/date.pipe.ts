import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'date',
  standalone: true,
})
export class PostedAtDatePipe implements PipeTransform {
  private readonly datePipe = new DatePipe('en-US');

  transform(
    value: string | null | undefined,
    format = 'mediumDate'
  ): string {
    if (!value || Number.isNaN(Date.parse(value))) {
      return '-';
    }

    return this.datePipe.transform(value, format) ?? '-';
  }
}