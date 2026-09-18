import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '../../core/services/api-service';
import { NewsResponse } from '../../core/interfaces/news';
import { NewsDashboard } from './news-dashboard';

const newsResponse: NewsResponse = {
  page: 1,
  nextPage: 2,
  items: [
    {
      id: 1,
      rank: 1,
      title: 'Test story',
      url: 'https://example.com/story',
      domain: 'example.com',
      author: 'tester',
      points: 10,
      comments: 2,
      postedAt: '2026-09-18T00:00:00',
    },
  ],
};

class MockApiService {
  response$ = of(newsResponse);

  getNews() {
    return this.response$;
  }
}

describe('NewsDashboard', () => {
  let component: NewsDashboard;
  let fixture: ComponentFixture<NewsDashboard>;
  let apiService: MockApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsDashboard],
      providers: [{ provide: ApiService, useClass: MockApiService }],
    }).compileComponents();

    fixture = TestBed.createComponent(NewsDashboard);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and render news', () => {
    expect(component.news()).toEqual(newsResponse);
    expect(component.dataSource.data).toEqual(newsResponse.items);
    expect(fixture.nativeElement.querySelector('table')).not.toBeNull();
    expect(component.loadingService.isLoading()).toBe(false);
  });

  it('should render the empty state when no news is available', () => {
    component.dataSource.data = [];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.no-data-container')).not.toBeNull();
  });

  it('should expose an error when loading fails', () => {
    apiService.response$ = throwError(() => new Error('Request failed'));
    component.loadNews();

    expect(component.error()).toBe('Failed to load news');
    expect(component.loadingService.isLoading()).toBe(false);
  });

  it('should render the reusable table and paginator', () => {
    expect(fixture.nativeElement.querySelector('app-table')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-paginator')).not.toBeNull();
  });

  it('should log the selected page', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    component.onPageChange({ pageIndex: 1 } as never);

    expect(logSpy).toHaveBeenCalledWith('Page:', 2);
    logSpy.mockRestore();
  });
});
