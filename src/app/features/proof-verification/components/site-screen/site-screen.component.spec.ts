import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteScreenComponent } from './site-screen.component';

describe('SiteScreenComponent', () => {
  let component: SiteScreenComponent;
  let fixture: ComponentFixture<SiteScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
