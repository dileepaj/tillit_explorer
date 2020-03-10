import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProofPoeComponent } from './proof-poe.component';

describe('ProofsComponent', () => {
  let component: ProofPoeComponent;
  let fixture: ComponentFixture<ProofPoeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProofPoeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProofPoeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
