import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { NewsResponse } from '../interfaces/news';

@Service()
export class ApiService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'assets/get-news.json';

  getNews(page = 2): Observable<NewsResponse> {
    //     return this.http.get<NewsResponse>(
    //   `${this.apiUrl}?page=${page}`
    // );
    return this.http.get<NewsResponse>(this.apiUrl);
  }
}