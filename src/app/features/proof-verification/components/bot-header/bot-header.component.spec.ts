import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotHeaderComponent } from './bot-header.component';

describe('BotHeaderComponent', () => {
  let component: BotHeaderComponent;
  let fixture: ComponentFixture<BotHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
