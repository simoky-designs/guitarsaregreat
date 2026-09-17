import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsDashboard } from './news-dashboard';

describe('NewsDashboard', () => {
  let component: NewsDashboard;
  let fixture: ComponentFixture<NewsDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(NewsDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
