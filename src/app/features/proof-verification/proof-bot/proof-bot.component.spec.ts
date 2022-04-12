import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofBotComponent } from './proof-bot.component';

describe('ProofBotComponent', () => {
  let component: ProofBotComponent;
  let fixture: ComponentFixture<ProofBotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProofBotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProofBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
