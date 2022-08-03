import { HttpClient } from '@angular/common/http';
import {  Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { WordTree } from 'src/app/word-tree/word.tree';

@Component({
  selector: 'gst-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @ViewChild('textInput') textInput: ElementRef<HTMLInputElement> | undefined;
  
  wordTree: WordTree = new WordTree([]);

  textValue: string = '';

  loading: boolean = true;

  constructor(private http: HttpClient, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.processWordList();
  }

  processWordList(): void {
    this.http.get('assets/WORD.LST', { responseType: 'text' }).subscribe(data => {
      this.wordTree = new WordTree(data.split('\n'));
      this.loading = false;
    })
  }

  inputChanged(ev: KeyboardEvent): void {
    if (!this.textInput) return;

    if (!/^[a-z]{1}$/.test(ev.key)) {
      this.textInput.nativeElement.value = this.textValue;
      return;
    }

    console.log('input', ev)

    this.textValue = `${this.textValue}${ev.key}`

    console.log('word node', this.wordTree.getNode(this.textValue));

    this.textInput.nativeElement.value = this.textValue;
  }

}
