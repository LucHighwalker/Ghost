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

  PlayerAnimations = PlayerAnimations;
  
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
      const word = `${this.textValue}${nextChar}`;

      if (!nextChar || this.wordTree.has(word)) {
        this.textValue = '';
        this.computerGhost++;
      } else {
        this.textValue = word;
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
