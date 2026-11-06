import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

/**
 * Contract for a routed component that can report a dirty form.
 * - **What:** a single predicate method.
 * - **Why:** the guard depends on this interface, not on concrete pages, so any page opts in without `shared` knowing about deals.
 */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Functional `canDeactivate` guard.
 * - **What:** asks for confirmation before leaving a route whose component reports unsaved changes.
 * - **Use when:** a route renders a form; the routed component must implement `HasUnsavedChanges`.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) return true;
  return inject(DOCUMENT).defaultView?.confirm('Discard unsaved changes?') ?? true;
};
