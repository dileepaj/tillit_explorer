import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotSegmentsComponent } from './bot-segments.component';

describe('BotSegmentsComponent', () => {
  let component: BotSegmentsComponent;
  let fixture: ComponentFixture<BotSegmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotSegmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotSegmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
