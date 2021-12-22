import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalStorageComponent } from './global-storage.component';

describe('GlobalStorageComponent', () => {
  let component: GlobalStorageComponent;
  let fixture: ComponentFixture<GlobalStorageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalStorageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
