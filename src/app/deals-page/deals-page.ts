import { Component } from '@angular/core';

@Component({
  selector: 'app-deals-page',
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800">
      <header class="border-b border-slate-200 bg-white px-6 py-4">
        <span class="text-base font-semibold text-slate-700">CRM System</span>
      </header>

      <main class="mx-auto max-w-5xl p-6">
        <div class="mb-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold">Deals</h1>
          <button
            type="button"
            class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            New Deal
          </button>
        </div>

        <div class="grid grid-cols-[260px_1fr] items-start gap-4">
          <aside class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <label class="relative block">
              <span class="sr-only">Filter deals</span>
              <input
                type="search"
                placeholder="Filter deals..."
                class="w-full rounded-md border border-slate-300 py-2 pl-3 pr-9 text-sm placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
                class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </label>

            <ul class="mt-3 space-y-1">
              <li>
                <button
                  type="button"
                  aria-current="true"
                  class="flex w-full items-start justify-between gap-2 rounded-md bg-emerald-50 px-3 py-2 text-left"
                >
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-semibold text-emerald-700">Enterprise License — Tech Solutions</span>
                    <span class="block text-xs text-emerald-700">$48,000</span>
                  </span>
                  <span class="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">negotiation</span>
                </button>
              </li>
              <li>
                <button type="button" class="flex w-full items-start justify-between gap-2 rounded-md px-3 py-2 text-left hover:bg-slate-100">
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-semibold text-slate-800">Pilot Program — DataFlow</span>
                    <span class="block text-xs text-slate-500">$12,000</span>
                  </span>
                  <span class="shrink-0 rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">new</span>
                </button>
              </li>
              <li>
                <button type="button" class="flex w-full items-start justify-between gap-2 rounded-md px-3 py-2 text-left hover:bg-slate-100">
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-semibold text-slate-800">Design Workshop — Creative Co</span>
                    <span class="block text-xs text-slate-500">$5,000</span>
                  </span>
                  <span class="shrink-0 rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">proposal</span>
                </button>
              </li>
              <li>
                <button type="button" class="flex w-full items-start justify-between gap-2 rounded-md px-3 py-2 text-left hover:bg-slate-100">
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-semibold text-slate-800">Renewal — BuildRight</span>
                    <span class="block text-xs text-slate-500">$24,000</span>
                  </span>
                  <span class="shrink-0 rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">closed-lost</span>
                </button>
              </li>
            </ul>
          </aside>

          <div>
            <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-lg font-semibold">Enterprise License — Tech Solutions</h2>
                  <p class="mt-1 text-sm text-slate-600">Annual enterprise license for 50 seats. Awaiting legal review.</p>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <span class="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">negotiation</span>
                  <button
                    type="button"
                    class="rounded-md border border-emerald-700 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <dl class="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt class="text-xs text-slate-500">Value</dt>
                  <dd class="mt-1 font-semibold">$48,000</dd>
                </div>
                <div>
                  <dt class="text-xs text-slate-500">Contact</dt>
                  <dd class="mt-1 font-semibold">Anna Kowalska</dd>
                </div>
                <div>
                  <dt class="text-xs text-slate-500">Public</dt>
                  <dd class="mt-1 font-semibold">Yes</dd>
                </div>
              </dl>
            </section>

            <section class="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between">
                <h2 class="text-base font-semibold">Tasks</h2>
                <button type="button" class="text-xs font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900">
                  Archive completed
                </button>
              </div>

              <div class="mt-3 flex items-end gap-3">
                <div class="flex-1">
                  <span class="block text-xs text-slate-600">New task</span>
                  <input
                    type="text"
                    placeholder="Task title..."
                    class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
                  />
                </div>
                <div class="w-36">
                  <span class="block text-xs text-slate-600">Priority</span>
                  <select class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30">
                    <option>Low</option>
                    <option selected>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <button
                  type="button"
                  class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  Add
                </button>
              </div>

              <ul class="mt-4 space-y-2">
                <li class="flex items-center justify-between rounded-md border border-slate-800 px-4 py-3">
                  <div class="flex items-start gap-3">
                    <input type="checkbox" class="mt-1 size-4 accent-emerald-700" aria-label="Mark Send revised proposal as done" />
                    <div>
                      <p class="text-sm font-medium">Send revised proposal</p>
                      <p class="text-xs text-slate-500">Due: 2026-03-15</p>
                    </div>
                  </div>
                  <span class="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">high</span>
                </li>
                <li class="flex items-center justify-between rounded-md border border-slate-800 px-4 py-3">
                  <div class="flex items-start gap-3">
                    <input type="checkbox" checked class="mt-1 size-4 accent-emerald-700" aria-label="Mark Schedule call with legal as not done" />
                    <div>
                      <p class="text-sm font-medium text-slate-500 line-through">Schedule call with legal</p>
                      <p class="text-xs text-slate-500">Due: 2026-03-10</p>
                    </div>
                  </div>
                  <span class="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">medium</span>
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
