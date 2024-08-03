import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClickTrackerServiceService {

  constructor() { }
  private insideHeader = false;

  setInside(value: boolean) {
    this.insideHeader = value;
  }

  isInside(): boolean {
    return this.insideHeader;
  }
}

