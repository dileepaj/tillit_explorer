import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofPococComponent } from './proof-pococ.component';

describe('PococComponent', () => {
  let component: ProofPococComponent;
  let fixture: ComponentFixture<ProofPococComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProofPococComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProofPococComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
