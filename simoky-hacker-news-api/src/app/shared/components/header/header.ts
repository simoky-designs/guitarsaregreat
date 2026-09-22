import { Component, inject, signal } from '@angular/core';
import { Button } from '../button/button';
import { NewsQueryService } from '../../../core/services/news-query-service';
import { Location } from '@angular/common'; 
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  APP_NAME,
  STORY_TYPE_BUTTONS,
  TABLE_TYPE_LABELS,
} from '../../const/app-const';
import { StoryTypes, getTableTypeLabel } from '../../types/componet-types';

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
    readonly storyTypeLabels = TABLE_TYPE_LABELS;
    readonly storyTypeButtons = STORY_TYPE_BUTTONS;
    title = signal<string>(TABLE_TYPE_LABELS.topstories);
    
    setStoryType(storyType: StoryTypes): void{
      this.location.go(storyType);
      this.title.set(getTableTypeLabel(storyType));
      this.queryService.setStoryType(storyType);
    }
}
