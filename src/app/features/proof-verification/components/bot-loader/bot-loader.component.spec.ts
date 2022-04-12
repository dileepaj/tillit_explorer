import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotLoaderComponent } from './bot-loader.component';

describe('BotLoaderComponent', () => {
  let component: BotLoaderComponent;
  let fixture: ComponentFixture<BotLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
