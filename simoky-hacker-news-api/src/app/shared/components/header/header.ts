import { Component, inject, signal } from '@angular/core';
import { Button } from '../button/button';
import { NewsQueryService } from '../../../core/services/news-query-service';
import { Location } from '@angular/common'; 
import { toTitleCase } from '../../utils/utils';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

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
    title = signal('Top Stories');
    
    setStoryType(storyType: 'top' | 'new' | 'best'): void{
      this.location.go(storyType);
      this.title.set(toTitleCase(`${storyType}\xa0Stories`));
      this.queryService.setStoryType(storyType);
    }
}
