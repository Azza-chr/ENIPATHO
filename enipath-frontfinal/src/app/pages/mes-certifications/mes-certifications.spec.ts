import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesCertifications } from './mes-certifications';

describe('MesCertifications', () => {
  let component: MesCertifications;
  let fixture: ComponentFixture<MesCertifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesCertifications],
    }).compileComponents();

    fixture = TestBed.createComponent(MesCertifications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
