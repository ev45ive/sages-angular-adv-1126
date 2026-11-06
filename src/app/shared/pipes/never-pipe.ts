import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'never',
})
export class NeverPipe implements PipeTransform {
  transform(value: never, message = 'Invalid value ' + value): never {
    throw new Error(message);
  }
}
