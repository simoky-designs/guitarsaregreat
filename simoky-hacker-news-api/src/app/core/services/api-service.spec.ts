import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api-service';
import { NewsItem } from '../interfaces/news';

describe('ApiService', () => {
  let service: ApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET the story IDs for the requested type', () => {
    const storyIds = [1, 2, 3, 4];

    service.getStoryIds('topstories').subscribe((ids) => {
      expect(ids).toEqual(storyIds);
    });

    const req = httpTesting.expectOne(`${service['apiUrl']}/${'topstories'}.json`);

    expect(req.request.method).toBe('GET');

    req.flush(storyIds);
  });

  it('should propagate an error when getting story IDs fails', () => {

    service.getStoryIds('beststories').subscribe({
      next: () => expect.fail('Expected an error'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Server Error');
      },
    });
    const req = httpTesting.expectOne(`${service['apiUrl']}/${'beststories'}.json`);
    req.flush('Something went wrong', { status: 500, statusText: 'Server Error' });
  });

  it('should GET a story by ID', () => {
    const storyId = 123;

    const story: NewsItem = {
      id: storyId,
      title: 'Test story',
      url: 'https://example.com',
    } as NewsItem;

    service.getStory(storyId).subscribe((result) => {
      expect(result).toEqual(story);
    });

    const req = httpTesting.expectOne(`${service['apiUrl']}/item/${storyId}.json`);

    expect(req.request.method).toBe('GET');

    req.flush(story);
  });

  it('should propagate an error when getting a story fails', () => {
    const storyId = 123;
    service.getStory(storyId).subscribe({
      next: () => expect.fail('Expected an error'),
      error: (error) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      },
    });
    const req = httpTesting.expectOne(`${service['apiUrl']}/item/${storyId}.json`);
    req.flush('Story not found', { status: 404, statusText: 'Not Found' });
  });
});
