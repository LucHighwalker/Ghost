import { AfterViewInit, Component, DoCheck, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'gst-sprite',
  template: `
    <canvas #canvas width="30px" height="39px"></canvas>
  `,
  styles: [
  ]
})
export class SpriteComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement> | undefined;

  @Input() spriteSheet: string = '';

  @Input() width: number = 30;
  @Input() height: number = 39;

  @Input() borderWidth: number = 0;
  @Input() spacing: number = 0;

  private _animationCache: string = '';
  private _animationFrame: number = 0;
  private _animation: [number, number][] = [[0, 0]];
  @Input() 
  set animation(anim: [number, number][]) {
    const cacheID = anim.map(f => f.join('-')).join('.');

    if (this._animationCache !== cacheID) {
      this._animationFrame = 0;
      this._animation = anim;
    }
  }
  @Input() frameTime: number = 250;
  @Input() loop: boolean = true;
  @Input() disableAnimation: boolean = false;

  @Output() animationEnded: EventEmitter<void> = new EventEmitter<void>();

  private _image: HTMLImageElement = new Image();
  private _animationIntervalID: any;

  constructor() { }

  ngAfterViewInit(): void {
      this.setSprite();
      this._animationIntervalID = setInterval(() => {
        this.animate();
        this.drawSprite();
      }, this.frameTime);
  }

  ngOnDestroy(): void {
      clearInterval(this._animationIntervalID);
  }

  setSprite(): void {
    this._image = new Image()
    this._image.src = this.spriteSheet;
    this._image.onload = () => this.drawSprite();
  }

  animate(): void {
    if (this.disableAnimation || !this._animation) return;
    if (this._animationFrame < this._animation.length) this._animationFrame++;
    if (this._animationFrame >= this._animation.length){ 
      if (this.loop) this._animationFrame = 0;
      else {
        this._animationFrame--;
        this.animationEnded.emit();
      }
    };
  }

  drawSprite(): void {
    if (!this._animation) return;

    const context = this.canvas?.nativeElement.getContext('2d');

    if (!this.canvas || !context) {
      console.error(Error('Failed to draw sprite. No canvas found.'))
      return;
    };

    context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height)

    const pos = this.spriteToImageCoordinates(...this._animation[this._animationFrame])

    context.drawImage(this._image, pos.x, pos.y, this.width, this.height, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  spriteToImageCoordinates(row: number, col: number): {x: number, y: number} {
    return {
      x: this.borderWidth + col * (this.spacing + this.width),
      y: this.borderWidth + row * (this.spacing + this.height),
    }
  }

}
