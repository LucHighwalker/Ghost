import { AfterViewInit, Component, DoCheck, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'gst-sprite',
  template: `
  <span>sprite</span>
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

  private _animationFrame: number = 0;
  @Input() animation: [number, number][] = [
    [1, 0],
    [1, 7],
    [1, 6],
    [1, 4],
    [2, 6],
    [2, 6],
    [2, 6],
    [2, 6],
  ];
  @Input() frameTime: number = 250;
  @Input() loop: boolean = true;
  @Input() disableAnimation: boolean = false;

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
    if (this.disableAnimation) return;
    if (this._animationFrame < this.animation.length) this._animationFrame++;
    if (this._animationFrame >= this.animation.length) this._animationFrame = this.loop ? 0 : this._animationFrame - 1;
  }

  drawSprite(): void {
    const context = this.canvas?.nativeElement.getContext('2d');

    if (!this.canvas || !context) {
      console.error(Error('Failed to draw sprite. No canvas found.'))
      return;
    };

    context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height)

    const pos = this.spriteToImageCoordinates(...this.animation[this._animationFrame])

    context.drawImage(this._image, pos.x, pos.y, this.width, this.height, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  spriteToImageCoordinates(row: number, col: number): {x: number, y: number} {
    return {
      x: this.borderWidth + col * (this.spacing + this.width),
      y: this.borderWidth + row * (this.spacing + this.height),
    }
  }

}
