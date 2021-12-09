import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationScreenComponent } from './verification-screen.component';

describe('VerificationScreenComponent', () => {
  let component: VerificationScreenComponent;
  let fixture: ComponentFixture<VerificationScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerificationScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificationScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
