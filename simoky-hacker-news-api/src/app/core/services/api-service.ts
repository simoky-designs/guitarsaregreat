import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { NewsItem } from '../interfaces/news';
import { environment } from '../../../environments/environment';
import { StoryType } from '../../shared/types/componet-types';
@Service()
export class ApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  getStoryIds(type: StoryType): Observable<number[]> {
    return this.http
      .get<number[]>(`${this.apiUrl}/${type}.json`)
      .pipe(catchError(() => throwError(() => new Error('Failed to load story IDs'))));
  }

  getStory(id: number): Observable<NewsItem> {
    return this.http
      .get<NewsItem>(`${this.apiUrl}/item/${id}.json`)
      .pipe(catchError(() => throwError(() => new Error(`Failed to load story ${id}`))));
  }
}
