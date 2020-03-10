import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProofPogComponent } from './proof-pog.component';

describe('ProofPogComponent', () => {
  let component: ProofPogComponent;
  let fixture: ComponentFixture<ProofPogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProofPogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProofPogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
