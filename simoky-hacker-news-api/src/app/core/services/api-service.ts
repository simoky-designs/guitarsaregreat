import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { NewsItem } from '../interfaces/news';
import { environment  } from '../../../environments/environment';
import { StoryTypes } from '../../shared/types/componet-types';
@Service()
export class ApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment .apiUrl;

  getStoryIds(type: StoryTypes): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/${type}stories.json`);
  }

  getStory(id: number): Observable<NewsItem> {
    return this.http.get<NewsItem>(`${this.apiUrl}/item/${id}.json`);
  }
}
