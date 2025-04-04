import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-color-generator',
  templateUrl: './color-generator.component.html',
  styleUrl: './color-generator.component.css'
})

export class ColorGeneratorComponent implements AfterViewInit {
  @Input() rows: number = 0;
  @Input() columns: number = 0;

  @ViewChild('colorCoordinateCanvas') colorCoordinateCanvas!: ElementRef;
  private context: CanvasRenderingContext2D | null = null;

    ngAfterViewInit(): void {
      this.context = this.colorCoordinateCanvas.nativeElement.getContext('2d');
      this.draw();
    }

    ngOnChanges(changes: SimpleChanges) {
      if (changes['rows'] || changes['columns']) {
        this.resetCanvas();
      }
    }

    cellWidth = 25;
    cellHeight = 25;
    canvasWidth = this.cellWidth * 702;

    draw(): void {
      if (this.context) {
        const canvas = this.colorCoordinateCanvas.nativeElement;

    
        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.columns; col++) {
            this.context.strokeStyle = 'black';
            this.context.strokeRect(col * this.cellWidth, row * this.cellHeight, this.cellWidth, this.cellHeight);

            this.context.fillStyle = 'black';
            this.context.font = '12px Arial';
            this.context.fillText(col.toString(), col * this.cellWidth + this.cellWidth / 2, row * this.cellHeight + this.cellHeight / 2);
          }
        }
      }
    }

    resetCanvas(): void {
      if (this.context) {
        this.context.clearRect(0, 0, 17750, 3000);
        this.draw();
      }
    }
}

/*
export class ColorGeneratorComponent {
  @Input() rows: number = 0;
  @Input() columns: number = 0;

  visibleTableCells: boolean[][] = [];
  rowIndices: number[] = [];
  columnIndices: number[] = [];
  headerLetters: string[] = [];

  ngOnInit() {
    this.visibleTableCells = 
            Array(this.rows)
            .fill(false)
            .map(() => Array(this.columns).fill(false));

    this.rowIndices = new Array(this.rows);
    this.columnIndices = new Array(this.columns);
    this.headerLetters = Array.from({ length: this.columns }, (_, i) =>
      this.convertHeaderNumberToLetters(i)
    );
  }

//  rowIndices = new Array(this.rows).fill(0);
 // columnIndices = Array.from({ length: this.columns }, (_, i) => i);

  toggleCellVisibility(row: number, column: number): void {
    this.visibleTableCells[row][column] = !this.visibleTableCells[row][column];
  }

  convertHeaderNumberToLetters(headerNumber: number): string {
    const alphabetSize = 26;
    const asciiOffset = 65;
    let letters = '';

    while (headerNumber >= 0) {
      letters = String.fromCharCode(headerNumber % alphabetSize + asciiOffset) + letters;
      headerNumber = Math.floor(headerNumber / alphabetSize) - 1;
    }
    return letters;
  }
}
  */
