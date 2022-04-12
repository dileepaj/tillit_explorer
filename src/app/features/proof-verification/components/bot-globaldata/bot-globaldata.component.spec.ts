import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotGlobaldataComponent } from './bot-globaldata.component';

describe('BotGlobaldataComponent', () => {
  let component: BotGlobaldataComponent;
  let fixture: ComponentFixture<BotGlobaldataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotGlobaldataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotGlobaldataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
