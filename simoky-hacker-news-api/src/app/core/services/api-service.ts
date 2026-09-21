import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { NewsItem } from '../interfaces/news';

@Service()
export class ApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://hacker-news.firebaseio.com/v0';

  getStoryIds(type: 'top' | 'new' | 'best'): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/${type}stories.json`);
  }

  getStory(id: number): Observable<NewsItem> {
    return this.http.get<NewsItem>(`${this.apiUrl}/item/${id}.json`);
  }
}
