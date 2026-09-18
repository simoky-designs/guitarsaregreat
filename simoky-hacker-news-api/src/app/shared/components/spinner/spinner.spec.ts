import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingService } from '../../../core/services/loading-service';
import { Spinner } from './spinner';

describe('Spinner', () => {
  let component: Spinner;
  let fixture: ComponentFixture<Spinner>;
  let loadingService: LoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spinner],
    }).compileComponents();

    fixture = TestBed.createComponent(Spinner);
    component = fixture.componentInstance;
    loadingService = TestBed.inject(LoadingService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide the spinner when loading is disabled', () => {
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
  });

  it('should render the spinner while loading', () => {
    loadingService.show();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-spinner')).not.toBeNull();
  });

  it('should remove the spinner after loading ends', () => {
    loadingService.show();
    fixture.detectChanges();
    loadingService.hide();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
  });
});
