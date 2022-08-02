import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'gst-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.processWordList();
  }

  processWordList(): void {
    this.http.get('assets/WORD.LST', { responseType: 'text' }).subscribe(data => {
      console.log('data', data.split('\n'))
    })
  }

}
