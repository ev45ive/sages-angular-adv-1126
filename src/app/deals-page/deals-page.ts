import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import {
  MatList,
  MatListItem,
  MatListItemIcon,
  MatListItemLine,
  MatListItemMeta,
  MatListItemTitle,
} from '@angular/material/list';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector: 'app-deals-page',
  imports: [
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatCheckbox,
    MatChip,
    MatChipSet,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatList,
    MatListItem,
    MatListItemIcon,
    MatListItemLine,
    MatListItemMeta,
    MatListItemTitle,
    MatOption,
    MatSelect,
    MatSuffix,
    MatToolbar,
  ],
  styles: [
    `
      mat-chip-set {
        display: flex !important;
      }

      :host() ::ng-deep mat-chip.special-chip-override [matchipcontent] {
        background: red !important;
      }

      ::ng-deep .banana {
        color: yellow;
      }
    `,
  ],
  //   .banana[_ngcontent-ng-c398410595]
  template: `
    <div class="min-h-screen bg-surface text-on-surface">
      <mat-toolbar class="border-b border-outline-variant">
        <span class="text-title-md">CRM System</span>
      </mat-toolbar>

      <main class="mx-auto max-w-5xl p-6">
        <div class="mb-4 flex items-center justify-between">
          <h1 class="text-headline-sm">Deals</h1>
          <button matButton="filled" type="button">New Deal</button>
        </div>

        <div class="grid grid-cols-[260px_1fr] items-start gap-4">
          <aside>
            <mat-form-field class="w-full">
              <mat-label>Filter deals</mat-label>
              <input matInput type="search" />
              <mat-icon matSuffix aria-hidden="true">search</mat-icon>
            </mat-form-field>

            <mat-list class="mt-3">
              <button mat-list-item type="button" aria-current="true" [activated]="true">
                <span matListItemTitle>Enterprise License — Tech Solutions</span>
                <span matListItemLine>$48,000</span>
                <mat-chip-set matListItemMeta>
                  <mat-chip>negotiation</mat-chip>
                </mat-chip-set>
              </button>
              <button mat-list-item type="button">
                <span matListItemTitle>Pilot Program — DataFlow</span>
                <span matListItemLine>$12,000</span>
                <mat-chip-set matListItemMeta>
                  <mat-chip>new</mat-chip>
                </mat-chip-set>
              </button>
              <button mat-list-item type="button">
                <span matListItemTitle>Design Workshop — Creative Co</span>
                <span matListItemLine>$5,000</span>
                <mat-chip-set matListItemMeta>
                  <mat-chip>proposal</mat-chip>
                </mat-chip-set>
              </button>
              <button mat-list-item type="button">
                <span matListItemTitle>Renewal — BuildRight</span>
                <span matListItemLine>$24,000</span>
                <mat-chip-set matListItemMeta>
                  <mat-chip>closed-lost</mat-chip>
                </mat-chip-set>
              </button>
            </mat-list>
          </aside>

          <div>
            <mat-card appearance="outlined">
              <mat-card-header>
                <mat-card-title>Enterprise License — Tech Solutions</mat-card-title>
                <mat-card-subtitle
                  >Annual enterprise license for 50 seats. Awaiting legal review.</mat-card-subtitle
                >
              </mat-card-header>
              <mat-card-content>
                <mat-chip-set class="special-chip-override">
                  <mat-chip>negotiation</mat-chip>
                </mat-chip-set>
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
              </mat-card-content>
              <mat-card-actions align="end">
                <button matButton="outlined" type="button">Edit</button>
              </mat-card-actions>
            </mat-card>

            <mat-card appearance="outlined" class="mt-4">
              <mat-card-header>
                <mat-card-title>Tasks</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="flex items-end gap-3">
                  <mat-form-field class="flex-1">
                    <mat-label>New task</mat-label>
                    <input matInput type="text" />
                  </mat-form-field>
                  <mat-form-field class="w-36">
                    <mat-label>Priority</mat-label>
                    <mat-select value="Medium">
                      <mat-option value="Low">Low</mat-option>
                      <mat-option value="Medium">Medium</mat-option>
                      <mat-option value="High">High</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <button matButton="filled" type="button">Add</button>
                </div>

                <mat-list class="mt-4">
                  <mat-list-item>
                    <mat-checkbox matListItemIcon aria-label="Mark Send revised proposal as done" />
                    <span matListItemTitle>Send revised proposal</span>
                    <span matListItemLine>Due: 2026-03-15</span>
                    <mat-chip-set matListItemMeta>
                      <mat-chip>high</mat-chip>
                    </mat-chip-set>
                  </mat-list-item>
                  <mat-list-item>
                    <mat-checkbox
                      matListItemIcon
                      checked
                      aria-label="Mark Schedule call with legal as not done"
                    />
                    <span matListItemTitle class="line-through">Schedule call with legal</span>
                    <span matListItemLine>Due: 2026-03-10</span>
                    <mat-chip-set matListItemMeta>
                      <mat-chip>medium</mat-chip>
                    </mat-chip-set>
                  </mat-list-item>
                </mat-list>
              </mat-card-content>
              <mat-card-actions align="end">
                <button matButton="text" type="button">Archive completed</button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class DealsPage {}
