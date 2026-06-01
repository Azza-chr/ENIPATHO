import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationCours } from './formation-cours';

describe('FormationCours', () => {
  let component: FormationCours;
  let fixture: ComponentFixture<FormationCours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationCours],
    }).compileComponents();

    fixture = TestBed.createComponent(FormationCours);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
