import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesBadges } from './mes-badges';

describe('MesBadges', () => {
  let component: MesBadges;
  let fixture: ComponentFixture<MesBadges>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesBadges],
    }).compileComponents();

    fixture = TestBed.createComponent(MesBadges);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
