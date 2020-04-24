import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedCardComponent } from './animated-card.component';

describe('AnimatedCardComponent', () => {
  let component: AnimatedCardComponent;
  let fixture: ComponentFixture<AnimatedCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimatedCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimatedCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
