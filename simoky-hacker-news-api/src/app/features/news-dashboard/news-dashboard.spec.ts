import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '../../core/services/api-service';
import { NewsItem } from '../../core/interfaces/news';
import { NewsDashboard } from './news-dashboard';

class MockApiService {
  readonly storyCalls: number[] = [];

  getStoryIds(): Observable<number[]> {
    return of(Array.from({ length: 250 }, (_, index) => index + 1));
  }

  getStory(id: number): Observable<NewsItem> {
    this.storyCalls.push(id);
    return of({
      id,
      score: id,
      title: `Story ${id}`,
      by: 'tester',
    });
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

  it('should load and render the first story chunk', () => {
    expect(component.queryService.response()?.items).toHaveLength(100);
    expect(component.queryService.response()?.items[0].id).toBe(1);
    expect(component.dataSource.data).toHaveLength(25);
    expect(fixture.nativeElement.querySelector('table')).not.toBeNull();
    expect(component.loadingService.isLoading()).toBe(false);
  });

  it('should render the empty state when no news is available', () => {
    component.dataSource.data = [];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.no-data-container')).not.toBeNull();
  });

  it('should expose an error when loading fails', () => {
    vi.spyOn(apiService, 'getStory').mockReturnValue(
      throwError(() => new Error('Request failed')),
    );
    component.queryService.load();

    expect(component.queryService.error()).toBe('Failed to load news');
    expect(component.loadingService.isLoading()).toBe(false);
  });

  it('should render the reusable table and paginator', () => {
    expect(fixture.nativeElement.querySelector('app-table')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-paginator')).not.toBeNull();
  });

  it('should append the next 100 stories when moving forward', () => {
    component.onPageChange({ pageIndex: 10, pageSize: 10 } as never);

    expect(apiService.storyCalls).toHaveLength(200);
    expect(component.queryService.response()?.items).toHaveLength(200);
    expect(component.dataSource.data[0].id).toBe(101);
  });

  it('should display the selected slice when moving forward and backward', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 10 } as never);
    expect(component.dataSource.data[0].id).toBe(11);

    component.onPageChange({ pageIndex: 0, pageSize: 10 } as never);
    expect(component.dataSource.data[0].id).toBe(1);
    expect(apiService.storyCalls).toHaveLength(100);
  });
});
