import { HttpClient } from '@angular/common/http';
import {  Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { PlayerAnimations } from 'src/app/animations';
import { WordNode, WordTree } from 'src/app/word-tree/word.tree';

@Component({
  selector: 'gst-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @ViewChild('textInput') textInput: ElementRef<HTMLInputElement> | undefined;

  Player1Animations = PlayerAnimations;
  
  wordTree: WordTree = new WordTree([]);

  textValue: string = '';

  loading: boolean = true;

  player1Ghost: number = 0;
  player2Ghost: number = 0;

  player1State: string = 'idle';
  player1States: any = {
    idle: {animationName: 'idle', loop: true, onDone: () => {}},
    hit: {animationName: 'hit', loop: false, onDone: () => this.player1State = 'idle'},
    danceEnter: {animationName: 'danceEnter', loop: false, onDone: () => this.player1State = 'dance'},
    dance: {animationName: 'dance', loop: true, onDone: () => {}},
    ghostEnter: {animationName: 'ghostEnter', loop: false, onDone: () => this.player1State = 'ghost'},
    ghost: {animationName: 'ghost', loop: true, onDone: () => {}},
    victory: {animationName: 'victory', loop: false, onDone: () => this.player1State = 'idle'},
  }

  player2State: string = 'idle';
  player2States: any = {
    idle: {animationName: 'idle', loop: true, onDone: () => {}},
    hit: {animationName: 'hit', loop: false, onDone: () => this.player2State = 'idle'},
    danceEnter: {animationName: 'danceEnter', loop: false, onDone: () => this.player2State = 'dance'},
    dance: {animationName: 'dance', loop: true, onDone: () => {}},
    ghostEnter: {animationName: 'ghostEnter', loop: false, onDone: () => this.player1State = 'ghost'},
    ghost: {animationName: 'ghost', loop: true, onDone: () => {}},
    victory: {animationName: 'victory', loop: false, onDone: () => this.player2State = 'idle'},
  }

  constructor(private http: HttpClient) { }

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
      this.player1Ghost++;

      this.player1State = 'hit'
      this.player2State = 'victory'
    } else {
      const nextChar = this.computerNextMove();
      const word = `${this.textValue}${nextChar}`;

      if (!nextChar || this.wordTree.has(word)) {
        this.textValue = '';
        this.player2Ghost++;

        this.player2State = 'hit'
        this.player1State = 'victory'
      } else {
        this.textValue = word;
      }
    }

    if (this.player1Ghost >= 5) {
      this.player1State = 'ghostEnter';
      this.player2State = 'danceEnter';
    } else if (this.player2Ghost >= 5) {
      this.player2State = 'ghostEnter';
      this.player1State = 'danceEnter';

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
    for (let count = node.longestOddLengthWord; count >= 0; count -= 2) {
      for (let i = 0; i < node.getWordsByLength(count).length; i++) {
        const word = node.getWordsByLength(count)[i];
        const nextChar = word.slice(this.textValue.length).charAt(0);
        
        if (!this.wordTree.has(`${this.textValue}${nextChar}`)) {
            possibleOddPlays.push(nextChar);
        }
      }
    }

    if (possibleOddPlays.length > 0) {
      return possibleOddPlays[Math.floor(Math.random() * possibleOddPlays.length)];
    } else {
      const longestWord = this.findLongestPlayableWord([...node.completions]);
      console.log('longest word', longestWord)
      return longestWord.length > 0 ? longestWord.slice(this.textValue.length).charAt(0) : null;
    }
  }

  findLongestPlayableWord(words: string[]): string {
    let longestWord: string = '';
    for (let w = 0; w < words.length; w++) {
      const word = words[w];
      for (let c = 0; c < word.length; c++) {
        const wordSlice = word.slice(0, c);
        if (this.wordTree.has(wordSlice) && longestWord.length < wordSlice.length) {
          longestWord = wordSlice;
          break;
        }
      }      
    }

    return longestWord;
  }
}
