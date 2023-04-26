import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[numericOnly]'
})
export class NumericOnlyDirective {
  @HostListener("keypress", ["$event"])
  onKeyPress(event: { shiftkey: any; preventDefault: () => void; key: any; }) {
    
    const possibleKeys = ['0','1','2','3','4','5','6','7','8','9'];
    if (event.shiftkey) {
      event.preventDefault();
      return false;
    }
    const key = event.key; 
    console.log(event.key);
    if (possibleKeys.includes(key)) return true;
    event.preventDefault();
    return false;
  }
  constructor() { }

}