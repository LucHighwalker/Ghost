import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { WordTree } from 'src/app/word-tree/word.tree';

@Component({
  selector: 'gst-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  wordTree: WordTree = new WordTree([]);

  loading: boolean = true;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.processWordList();
  }

  processWordList(): void {
    this.http.get('assets/WORD.LST', { responseType: 'text' }).subscribe(data => {
      this.wordTree = new WordTree(data.split('\n'))
      this.loading = false;
    })
  }

}
