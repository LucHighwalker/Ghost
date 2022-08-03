import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'gst-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent {

  displayInstructions: boolean = false;

  constructor(private router: Router) { }

  playGame(): void {
    this.router.navigate(['game'])
  }

}
