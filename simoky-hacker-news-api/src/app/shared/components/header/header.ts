import { Component, inject } from '@angular/core';
import { Button } from '../button/button';
import { NewsQueryService } from '../../../core/services/news-query-service';

@Component({
  imports: [Button],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
  standalone: true,
})
export class Header {
    readonly queryService = inject(NewsQueryService);
    
    setStoryType(storyType: 'top' | 'new' | 'best'): void{
      this.queryService.setStoryType(storyType);
    }
}
