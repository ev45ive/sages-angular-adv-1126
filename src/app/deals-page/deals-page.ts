import { Component } from '@angular/core';

@Component({
  selector: 'app-deals-page',
  template: `
    <div class="min-h-screen bg-surface text-on-surface">
      <header class="border-b border-outline-variant bg-surface-container-low px-6 py-4">
        <span class="text-title-md text-on-surface-variant">CRM System</span>
      </header>

      <main class="mx-auto max-w-5xl p-6">
        <div class="mb-4 flex items-center justify-between">
          <h1 class="text-headline-sm">Deals</h1>
          <button type="button" class="btn-filled">New Deal</button>
        </div>

        <div class="grid grid-cols-[260px_1fr] items-start gap-4">
          <aside class="card p-3">
            <label class="relative block">
              <span class="sr-only">Filter deals</span>
              <input type="search" placeholder="Filter deals..." class="field pr-9" />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
                class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </label>

            <ul class="mt-3 space-y-1">
              <li>
                <button type="button" aria-current="true" class="list-item list-item-active">
                  <span class="min-w-0">
                    <span class="block truncate text-title-sm">Enterprise License — Tech Solutions</span>
                    <span class="meta block">$48,000</span>
                  </span>
                  <span class="badge bg-tertiary-container text-on-tertiary-container">negotiation</span>
                </button>
              </li>
              <li>
                <button type="button" class="list-item">
                  <span class="min-w-0">
                    <span class="block truncate text-title-sm">Pilot Program — DataFlow</span>
                    <span class="meta block">$12,000</span>
                  </span>
                  <span class="badge bg-secondary-container text-on-secondary-container">new</span>
                </button>
              </li>
              <li>
                <button type="button" class="list-item">
                  <span class="min-w-0">
                    <span class="block truncate text-title-sm">Design Workshop — Creative Co</span>
                    <span class="meta block">$5,000</span>
                  </span>
                  <span class="badge bg-surface-variant text-on-surface-variant">proposal</span>
                </button>
              </li>
              <li>
                <button type="button" class="list-item">
                  <span class="min-w-0">
                    <span class="block truncate text-title-sm">Renewal — BuildRight</span>
                    <span class="meta block">$24,000</span>
                  </span>
                  <span class="badge bg-error-container text-on-error-container">closed-lost</span>
                </button>
              </li>
            </ul>
          </aside>

          <div>
            <section class="card">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-title-lg">Enterprise License — Tech Solutions</h2>
                  <p class="mt-1 text-body-md text-on-surface-variant">Annual enterprise license for 50 seats. Awaiting legal review.</p>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <span class="badge bg-tertiary-container text-on-tertiary-container">negotiation</span>
                  <button type="button" class="btn-outlined">Edit</button>
                </div>
              </div>
              <dl class="mt-4 grid grid-cols-3 gap-4 text-body-md">
                <div>
                  <dt class="meta">Value</dt>
                  <dd class="mt-1 text-title-sm">$48,000</dd>
                </div>
                <div>
                  <dt class="meta">Contact</dt>
                  <dd class="mt-1 text-title-sm">Anna Kowalska</dd>
                </div>
                <div>
                  <dt class="meta">Public</dt>
                  <dd class="mt-1 text-title-sm">Yes</dd>
                </div>
              </dl>
            </section>

            <section class="mt-4 card">
              <div class="flex items-center justify-between">
                <h2 class="text-title-md">Tasks</h2>
                <button type="button" class="btn-text">Archive completed</button>
              </div>

              <div class="mt-3 flex items-end gap-3">
                <div class="flex-1">
                  <span class="meta block">New task</span>
                  <input type="text" placeholder="Task title..." class="field mt-1" />
                </div>
                <div class="w-36">
                  <span class="meta block">Priority</span>
                  <select class="field mt-1">
                    <option>Low</option>
                    <option selected>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <button type="button" class="btn-filled">Add</button>
              </div>

              <ul class="mt-4 space-y-2">
                <li class="task-row">
                  <div class="flex items-start gap-3">
                    <input type="checkbox" class="mt-1 size-4 accent-primary" aria-label="Mark Send revised proposal as done" />
                    <div>
                      <p class="text-title-sm">Send revised proposal</p>
                      <p class="meta">Due: 2026-03-15</p>
                    </div>
                  </div>
                  <span class="badge bg-error-container text-on-error-container">high</span>
                </li>
                <li class="task-row">
                  <div class="flex items-start gap-3">
                    <input type="checkbox" checked class="mt-1 size-4 accent-primary" aria-label="Mark Schedule call with legal as not done" />
                    <div>
                      <p class="text-title-sm text-on-surface-variant line-through">Schedule call with legal</p>
                      <p class="meta">Due: 2026-03-10</p>
                    </div>
                  </div>
                  <span class="badge bg-tertiary-container text-on-tertiary-container">medium</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class DealsPage {}
