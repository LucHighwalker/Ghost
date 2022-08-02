import { Component } from '@angular/core';

@Component({
  selector: 'gst-root',
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  title = 'Ghost';
}
