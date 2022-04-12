import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorIdComponent } from './error-id.component';

describe('ErrorIdComponent', () => {
  let component: ErrorIdComponent;
  let fixture: ComponentFixture<ErrorIdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorIdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
