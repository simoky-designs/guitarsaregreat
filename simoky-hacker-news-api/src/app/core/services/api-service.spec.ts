import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ApiService } from './api-service';
import { NewsItem } from '../interfaces/news';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiService,
      ],
    });

    service = TestBed.inject(ApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('getStoryIds', () => {
    it('should GET story IDs for the requested story type', () => {
      const storyType = 'topstories';
      const storyIds = [1, 2, 3, 4];

      service.getStoryIds(storyType).subscribe((ids) => {
        expect(ids).toEqual(storyIds);
      });

      const req = httpTesting.expectOne(
        `${environment.apiUrl}/${storyType}.json`,
      );

      expect(req.request.method).toBe('GET');

      req.flush(storyIds);
    });

    it('should return a custom error when loading story IDs fails', () => {
      const storyType = 'beststories';

      service.getStoryIds(storyType).subscribe({
        next: () => {
          expect.fail('Expected request to fail');
        },
        error: (error: Error) => {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe('Failed to load story IDs');
        },
      });

      const req = httpTesting.expectOne(
        `${environment.apiUrl}/${storyType}.json`,
      );

      req.flush('Server error', {
        status: 500,
        statusText: 'Server Error',
      });
    });
  });

  describe('getStory', () => {
    it('should GET a story by ID', () => {
      const storyId = 123;

      const story: NewsItem = {
        id: storyId,
        type: 'story',
        time: 1234567890,
        title: 'Test story',
        by: 'tester',
        score: 10,
        url: 'https://example.com',
      };

      service.getStory(storyId).subscribe((result) => {
        expect(result).toEqual(story);
      });

      const req = httpTesting.expectOne(
        `${environment.apiUrl}/item/${storyId}.json`,
      );

      expect(req.request.method).toBe('GET');

      req.flush(story);
    });

    it('should return a custom error when loading a story fails', () => {
      const storyId = 123;

      service.getStory(storyId).subscribe({
        next: () => {
          expect.fail('Expected request to fail');
        },
        error: (error: Error) => {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe(`Failed to load story ${storyId}`);
        },
      });

      const req = httpTesting.expectOne(
        `${environment.apiUrl}/item/${storyId}.json`,
      );

      req.flush('Story not found', {
        status: 404,
        statusText: 'Not Found',
      });
    });
  });
});