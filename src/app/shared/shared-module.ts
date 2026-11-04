import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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
import { MatLineModule } from '@angular/material/core';

// const SharedImports = [
// ]

export const SharedForms = [
  MatOption,
  MatSelect,
  MatSuffix,
  MatCheckbox,
  MatFormField,
  MatInput,
  MatLabel,
  [[[MatButton]]],
];

export const SharedUI = [
  CommonModule,

  MatButton,
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,

  MatChip,
  MatChipSet,
  MatIcon,
  MatList,
  // MatLineModule,
  MatListItem,
  MatListItemLine,
  MatListItemMeta,
  MatListItemTitle,
  MatListItemIcon,
  MatToolbar,
];

export const SharedImports = [
  CommonModule,
  SharedForms,
  //
  SharedUI,
];

@NgModule({
  declarations: [],
  imports: [SharedImports],
  exports: [
    // ...SharedImports
    SharedImports,
  ],
})
export class SharedModule {}
