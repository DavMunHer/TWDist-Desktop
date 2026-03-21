/**
 * Vitest setup file for Angular TestBed integration (zoneless).
 *
 * Responsibilities:
 * 1. Call ɵresolveComponentResources() so Angular JIT can load templateUrl/styleUrl
 *    files from the file system (jsdom has no HTTP server to serve them).
 *    NOTE: This resolves resources for components imported BEFORE this file runs.
 *    Component specs must also call resolveComponentResources() in beforeEach()
 *    to resolve resources for components imported in the spec itself.
 * 2. Call TestBed.initTestEnvironment() using the platform-browser-dynamic testing
 *    platform, but WITHOUT loading zone.js. Tests opt into zoneless change detection
 *    individually via provideZonelessChangeDetection() in configureTestingModule().
 * 3. Reset TestBed after every test for isolation.
 */
import '@angular/compiler';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { TestBed, getTestBed } from '@angular/core/testing';
import { afterEach } from 'vitest';

// ─── TestBed environment (zoneless) ──────────────────────────────────────────
// Zone.js is NOT loaded. Each test that uses TestBed must provide
// provideZonelessChangeDetection() in its configureTestingModule() providers.

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
  { teardown: { destroyAfterEach: true } }
);

// A clean module per test prevents state leaking between specs
afterEach(() => {
  TestBed.resetTestingModule();
});
