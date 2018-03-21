import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShapeChartComponent } from './line-chart.component';

describe('ShapeChartComponent', () => {
  let component: ShapeChartComponent;
  let fixture: ComponentFixture<ShapeChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShapeChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShapeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
