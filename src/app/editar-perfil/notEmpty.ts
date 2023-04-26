import { FormGroup } from '@angular/forms';

// custom validator to check that two fields match
import { AbstractControl } from '@angular/forms';

export function NotEmpty(control: AbstractControl) {
  return null;
}
