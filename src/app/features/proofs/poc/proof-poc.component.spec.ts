import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofPocComponent } from './proof-poc.component';

describe('PocComponent', () => {
  let component: ProofPocComponent;
  let fixture: ComponentFixture<ProofPocComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProofPocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProofPocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
