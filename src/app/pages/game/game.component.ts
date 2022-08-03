import { HttpClient } from '@angular/common/http';
import {  Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { WordNode, WordTree } from 'src/app/word-tree/word.tree';

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

  playerGhost: number = 0;
  computerGhost: number = 0;

  constructor(private http: HttpClient, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.processWordList();
  }

  processWordList(): void {
    this.http.get('assets/WORD.LST', { responseType: 'text' }).subscribe(data => {
      const words = data.split('\n')
      this.wordTree = new WordTree(words, 4);
      this.loading = false;
    })
  }

  getGhost(num: number): string {
    return 'GHOST'.slice(0, num)
  } 

  playerInput(ev: KeyboardEvent): void {
    if (!this.textInput) return;

    if (!/^[a-z]{1}$/.test(ev.key)) {
      this.textInput.nativeElement.value = this.textValue;
      return;
    }

    console.log('input', ev)

    this.textValue = `${this.textValue}${ev.key}`

    if (this.wordTree.has(this.textValue) || this.wordTree.getNode(this.textValue) === null) {
      this.textValue = '';
      this.playerGhost++;
    } else {
      const nextChar = this.computerNextMove();

      if (!nextChar) {
        this.textValue = '';
        this.computerGhost++;
      } else {
        this.textValue = `${this.textValue}${nextChar}`
      }
    }

    this.textInput.nativeElement.value = this.textValue;
  }

  computerNextMove(): string | null {
    console.log('node', this.wordTree.getNode(this.textValue))

    const node = this.wordTree.getNode(this.textValue);

    if (!node) {
      throw new Error('Cannot find optimal move on null node');
    }

    const possibleOddPlays: string[] = []
    const allPossiblePlays: string[] = []
    for (let count = node.longestOddLengthWord; count >= 0; count -= 1) {
      for (let i = 0; i < node.getWordsByLength(count).length; i++) {
        const word = node.getWordsByLength(count)[i];
        const nextChar = word.slice(this.textValue.length).charAt(0);
        
        if (!this.wordTree.has(`${this.textValue}${nextChar}`)) {
          if (count % 2 === 1) {
            possibleOddPlays.push(nextChar);
          }

          allPossiblePlays.push(nextChar)
        }
      }
    }

    if (possibleOddPlays.length > 0) {
      return possibleOddPlays[Math.floor(Math.random() * possibleOddPlays.length)];
    } else if (allPossiblePlays.length > 0) {
      return allPossiblePlays[Math.floor(Math.random() * allPossiblePlays.length)];
    } else {
      return null;
    }
  }

}
