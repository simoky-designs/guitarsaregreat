import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading-service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should start with loading disabled', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should enable loading when shown', () => {
    service.show();

    expect(service.isLoading()).toBe(true);
  });

  it('should disable loading when hidden', () => {
    service.show();
    service.hide();

    expect(service.isLoading()).toBe(false);
  });
});
