export class WordTree {
    words: string[] = [];
    wordsSet: Set<string> = new Set<string>();
    get size(): number {
        return this.words.length;
    }

    roots: {[root: string]: WordNode} = {};

    private _minWordLength: number;
    private _maxWordLength: number;

    constructor(words: string[], minWordLength: number = 3, maxWordLength: number = 9999) {
        this._minWordLength = minWordLength;
        this._maxWordLength = maxWordLength;

        words.forEach(word => this.addWord(word.toLowerCase()));
    }

    addWord(word: string): void {
        if (word.length < this._minWordLength || word.length > this._maxWordLength) return;

        const firstChar = word.charAt(0);
        if (!this.getRoot(firstChar)) {
            this.roots[firstChar] = new WordNode(this, firstChar, word);
        }

        let currentNode = this.getRoot(firstChar) as WordNode;
        currentNode.addWord(word);

        for (let i = 1; i < word.length; i++) {
            const char = word.charAt(i);
            
            let child = currentNode.getChild(char);
            if (!child) {
                child = currentNode.addChild(char, word);
            } 
            
            child.addWord(word);

            currentNode = child;
        }

        this.words.push(word)
        this.wordsSet.add(word);
    }

    has(word: string): boolean {
        return this.wordsSet.has(word)
    }

    getRoot(character: string): WordNode | null {
        return this.roots[character] || null;
    }

    getNode(word: string): WordNode | null {
        const char = word.charAt(0).toLowerCase();
        return this.roots[char] ? this.roots[char].getNode(word) : null;
      }
}

export class WordNode {
    private _wordTree: WordTree;
    get wordTree(): WordTree {
        return this._wordTree;
    }
    
    private _character: string;
    get character(): string {
        return this._character;
    }

    private _completions: Set<string> = new Set<string>();
    get completions(): IterableIterator<string> {
        return this._completions.values()
    }
    
    private _children: { [character: string]: WordNode } = {};

    private _wordsByLength: {[length: number]: string[]} = {};

    private _longestOddLengthWord: number = -1;
    get longestOddLengthWord(): number {
        return this._longestOddLengthWord;
    }
    private _longestEvenLengthWord: number = -1;
    get longestEvenLengthWord(): number {
        return this._longestEvenLengthWord;
    }

    private _shortestOddLengthWord: number  = -1;
    get shortestOddLengthWord(): number  {
        return this._shortestOddLengthWord;
    }
    private _shortestEvenLengthWord: number  = -1;
    get shortestEvenLengthWord(): number  {
        return this._shortestEvenLengthWord;
    }

    constructor(wordTree: WordTree, character: string, word: string) {
        this._wordTree = wordTree;
        this._character = character;

        this.addWord(word);
    }

    addWord(word: string): void {
        if (this._completions.has(word)) return;


        if (word.length % 2 === 0) {
            if (this._longestEvenLengthWord < 0 || this._longestEvenLengthWord < word.length) {
                this._longestEvenLengthWord = word.length;
            }
            
            if (this._shortestEvenLengthWord < 0 || this._shortestEvenLengthWord > word.length) {
                this._shortestEvenLengthWord = word.length
            }
        } else {
            if (this._longestOddLengthWord < 0 || this._longestOddLengthWord < word.length) {
                this._longestOddLengthWord = word.length;
            }
            
            if (this._shortestOddLengthWord < 0 || this._shortestOddLengthWord > word.length) {
                this._shortestOddLengthWord = word.length
            }
        }

        if (!this._wordsByLength[word.length]) {
            this._wordsByLength[word.length] = [];
        }
        this._wordsByLength[word.length].push(word)


        this._completions.add(word);
    }

    getWordsByLength(length: number): string[] {
        return this._wordsByLength[length] || [];
    }

    getChild(character: string): WordNode | null {
        return this._children[character] || null;
    }

    addChild(character: string, word: string): WordNode {
        if (this._children[character]) {
            throw new Error('Attempting to overwrite existing child.')
        } else {
            this._children[character] = new WordNode(this.wordTree, character, word)
        }

        return this._children[character]
    }

    getNode(word: string, index: number = 0): WordNode | null {
        if (index + 1 === word.length) {
            return this;
        } else {
            const child = this.getChild(word.charAt(index + 1));
            return child !== null ? child.getNode(word, index + 1) : null;
        }
    }
}