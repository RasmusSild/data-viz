import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomiserComponent } from './customiser.component';

describe('CustomiserComponent', () => {
  let component: CustomiserComponent;
  let fixture: ComponentFixture<CustomiserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomiserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomiserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
