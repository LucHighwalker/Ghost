import { HttpClient } from '@angular/common/http';
import {  Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ComputerAnimations, PlayerAnimations } from 'src/app/animations';
import { Keyboard } from 'src/app/keyboard';
import { WordNode, WordTree } from 'src/app/word-tree/word.tree';

@Component({
  selector: 'gst-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @ViewChild('textInput') textInput: ElementRef<HTMLInputElement> | undefined;

  Keyboard = Keyboard;

  Player1Animations = PlayerAnimations;
  Player2Animations = ComputerAnimations;
  
  wordTree: WordTree = new WordTree([]);

  textValue: string = '';

  loading: boolean = true;

  pastWords: string[] = [];

  animationStates: any = {
    idle: {animationName: 'idle', loop: true, onDone: () => {}},
    hit: {animationName: 'hit', loop: false, onDone: (player: 1 | 2) => this.playerStates[player].currentState = 'idle'},
    danceEnter: {animationName: 'danceEnter', loop: false, onDone: (player: 1 | 2) => this.playerStates[player].currentState = 'dance'},
    dance: {animationName: 'dance', loop: true, onDone: () => {}},
    ghostEnter: {animationName: 'ghostEnter', loop: false, onDone: (player: 1 | 2) => this.playerStates[player].currentState = 'ghost'},
    ghost: {animationName: 'ghost', loop: true, onDone: () => {}},
    victory: {animationName: 'victory', loop: false, onDone: (player: 1 | 2) => this.playerStates[player].currentState = 'idle'},
  }

  playerStates: {
    1: {lives: number, currentState: string},
    2: {lives: number, currentState: string},
  } = {
    1: {
      lives: 5,
      currentState: 'idle'
    },
    2: {
      lives: 5,
      currentState: 'idle'
    }
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

  resetGame(): void {
    this.playerStates = {
      1: {
        lives: 5,
        currentState: 'idle'
      },
      2: {
        lives: 5,
        currentState: 'idle'
      }
    }

    this.pastWords = [];

    this.textValue = '';
  }

  getGhost(num: number): string {
    return 'GHOST'.slice(0, num)
  }

  playerInput(key: string, player: 1 | 2): void {
    const newWord = `${this.textValue}${key}`
    const otherPlayer = player === 1 ? 2 : 1;

    if (this.wordTree.has(newWord) || this.wordTree.getNode(newWord) === null) {
      this.playerStates[player].lives--;
      
      this.playerStates[player].currentState = 'hit'
      this.playerStates[otherPlayer].currentState = 'victory'

      this.pastWords.push(newWord);

      this.textValue = '';
    } else {
      this.textValue = newWord;
    }

    if (this.playerStates[player].lives <= 0) {
      this.playerStates[player].currentState = 'ghostEnter'
      this.playerStates[otherPlayer].currentState = 'danceEnter'
    }

    if (player === 1 && this.textValue.length > 0) {
      const nextMove = this.computerNextMove();

      this.playerInput(nextMove || 'x', 2)
    }
  }

  computerNextMove(): string | null {
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
