import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Header } from './header';
import { NewsQueryService } from '../../../core/services/news-query-service';
import { StoryType } from '../../types/componet-types';
import { TABLE_TYPE_LABELS } from '../../const/app-const';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let queryService: {
    setStoryType: ReturnType<typeof vi.fn>;
  };
  let location: {
    go: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    queryService = {
      setStoryType: vi.fn(),
    };

    location = {
      go: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        {
          provide: NewsQueryService,
          useValue: queryService,
        },
        {
          provide: Location,
          useValue: location,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the top stories title initially', () => {
    expect(component.title()).toBe(TABLE_TYPE_LABELS.topstories);
  });

  describe('setStoryType', () => {
    it('should update the browser location', () => {
      const storyType: StoryType = 'beststories';

      component.setStoryType(storyType);

      expect(location.go).toHaveBeenCalledWith(storyType);
    });

    it('should update the title', () => {
      const storyType: StoryType = 'beststories';

      component.setStoryType(storyType);

      expect(component.title()).toBe(TABLE_TYPE_LABELS.beststories);
    });

    it('should update the story type in the query service', () => {
      const storyType: StoryType = 'beststories';

      component.setStoryType(storyType);

      expect(queryService.setStoryType).toHaveBeenCalledWith(storyType);
    });

    it('should update location, title and query service', () => {
      const storyType: StoryType = 'newstories';

      component.setStoryType(storyType);

      expect(location.go).toHaveBeenCalledWith(storyType);
      expect(component.title()).toBe(TABLE_TYPE_LABELS.newstories);
      expect(queryService.setStoryType).toHaveBeenCalledWith(storyType);
    });
  });
});
