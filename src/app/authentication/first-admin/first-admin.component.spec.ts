import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstAdminComponent } from './first-admin.component';

describe('FirstAdminComponent', () => {
  let component: FirstAdminComponent;
  let fixture: ComponentFixture<FirstAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirstAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
