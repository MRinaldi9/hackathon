import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('crea il componente radice', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('espone un router-outlet nel template', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).not.toBeNull();
  });
});
