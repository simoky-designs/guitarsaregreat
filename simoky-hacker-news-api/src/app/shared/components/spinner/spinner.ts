import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading-service';

@Component({
  imports: [MatProgressSpinnerModule],
  selector: 'app-spinner',
  styleUrl: './spinner.scss',
  templateUrl: './spinner.html',
  standalone: true,
})
export class Spinner {
  readonly loadingService = inject(LoadingService);
}
