import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementDividerComponent } from './element-divider.component';

describe('ElementDividerComponent', () => {
  let component: ElementDividerComponent;
  let fixture: ComponentFixture<ElementDividerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElementDividerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
