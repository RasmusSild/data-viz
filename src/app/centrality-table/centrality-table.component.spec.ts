import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralityTableComponent } from './centrality-table.component';

describe('CentralityTableComponent', () => {
  let component: CentralityTableComponent;
  let fixture: ComponentFixture<CentralityTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentralityTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentralityTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
