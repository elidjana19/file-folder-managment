import { TestBed } from '@angular/core/testing';

import { ClickTrackerServiceService } from './click-tracker-service.service';

describe('ClickTrackerServiceService', () => {
  let service: ClickTrackerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClickTrackerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
