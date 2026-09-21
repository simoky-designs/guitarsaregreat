import { Component, inject, signal } from '@angular/core';
import { Button } from '../button/button';
import { NewsQueryService } from '../../../core/services/news-query-service';
import { Location } from '@angular/common'; 
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  APP_NAME,
  DISABLED_NAV_LABELS,
  getStoryTypeLabel,
  STORY_TYPE_LABELS,
  StoryType,
} from '../../const/app-constants';

@Component({
  imports: [Button, MatButtonToggleModule],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
  standalone: true,
})
export class Header {
    readonly queryService = inject(NewsQueryService);
    readonly location = inject(Location);
    readonly appName = APP_NAME;
    readonly disabledNavLabels = DISABLED_NAV_LABELS;
    readonly storyTypeLabels = STORY_TYPE_LABELS;
    title = signal<string>(STORY_TYPE_LABELS.top);
    
    setStoryType(storyType: StoryType): void{
      this.location.go(storyType);
      this.title.set(getStoryTypeLabel(storyType));
      this.queryService.setStoryType(storyType);
    }
}
