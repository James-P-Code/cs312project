import { Component, Input, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-color-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './color-generator.component.html',
  styleUrl: './color-generator.component.css'
})

export class ColorGeneratorComponent {
  @Input() rows: number = 0;
  @Input() columns: number = 0;

  public rowIndices: number[] = [];
  public columnIndices: number[] = [];
  public headerLetters: string[] = [];
  public isTableVisible = false;

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['rows'] || changes['columns']) {
      this.initializeTable();
    }

    document.addEventListener('DOMContentLoaded', () => {
      const coordinateTable = document.querySelector('#coordinate-table') as HTMLElement;
      coordinateTable!.style.display = 'inline';
    })
  }

  private initializeTable() {
    this.rowIndices = new Array(this.rows);
    this.columnIndices = new Array(this.columns);
    this.headerLetters = Array.from({ length: this.columns }, (_, i) => this.convertHeaderNumberToLetters(i));
  }

  private convertHeaderNumberToLetters(headerNumber: number): string {
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