import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cosechas } from './cosechas';

describe('Cosechas', () => {
  let component: Cosechas;
  let fixture: ComponentFixture<Cosechas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Cosechas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cosechas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
