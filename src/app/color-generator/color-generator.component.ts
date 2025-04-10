import {
  Component,
  Input,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-generator',
  standalone: true,
  imports: [NgStyle, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './color-generator.component.html',
  styleUrl: './color-generator.component.css',
})
export class ColorGeneratorComponent {
  @Input() rows: number = 0;
  @Input() columns: number = 0;
  @Input() colors: number = 0;

  public rowIndices: number[] = [];
  public columnIndices: number[] = [];
  public headerLetters: string[] = [];
  public isTableVisible = false;

  public colorOptions: { label: string; value: string }[] = [
    { label: 'red',    value: 'red' },
    { label: 'orange', value: 'orange' },
    { label: 'yellow', value: 'yellow' },
    { label: 'green',  value: 'green' },
    { label: 'blue',   value: 'blue' },
    { label: 'purple', value: 'purple' },
    { label: 'teal',   value: 'teal' },
    { label: 'grey',   value: 'grey' },
    { label: 'brown',  value: '#8B4513' }, // default brown is ugly ;)
    { label: 'black',  value: 'black' },
  ];
  
  public selectedRowIndex: number | null = null;
  public colorSelections: string[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['rows'] || changes['columns'] || changes['colors']) {
      this.initializeTable();
    }

    document.addEventListener('DOMContentLoaded', () => {
      const coordinateTable = document.querySelector(
        '#coordinate-table'
      ) as HTMLElement;
      coordinateTable!.style.display = 'inline';
    });
  }

  private initializeTable() {
    this.rowIndices = new Array(this.rows);
    this.columnIndices = new Array(this.columns);

    this.headerLetters = Array.from({ length: this.columns }, (_, i) => this.convertHeaderNumberToLetters(i));

    const previousColorCount = this.colorSelections.length;
    const previousSelectedIndex = this.selectedRowIndex;

    this.colorSelections = Array.from({ length: this.colors }, (_, i) => this.colorOptions[i % this.colorOptions.length].value);

    // Updates the radio button on initialization or updates so one is always selected.
    // Lots of logs for different edge cases, possibly remove/comment out after shipping finished product
    if (this.colorSelections.length > 0 && (this.selectedRowIndex === null || this.selectedRowIndex >= this.colorSelections.length)) {
      this.selectedRowIndex = 0;
      console.log(`
        [ColorGenerator] Radio button reset triggered.
        Previous color count: ${previousColorCount}, New color count: ${this.colorSelections.length},
        Previous selected index: ${previousSelectedIndex}, New selected index: ${this.selectedRowIndex}`);
    } else if (this.colorSelections.length > 0 && this.selectedRowIndex === null) {
      this.selectedRowIndex = 0;
      console.log(`
        [ColorGenerator] Initial radio button selection.
        Color count: ${this.colorSelections.length}, Selected index set to: ${this.selectedRowIndex}`);
    } else if (this.colorSelections.length === 0 && this.selectedRowIndex !== null) {
      this.selectedRowIndex = null;
      console.log(`
        [ColorGenerator] Radio button deselected due to no available colors.
        Previous selected index: ${previousSelectedIndex}`);
    } else if (this.selectedRowIndex !== previousSelectedIndex) {
      console.log(`
        [ColorGenerator] Selected index changed (unlikely due to table update logic).
        Previous selected index: ${previousSelectedIndex}, New selected index: ${this.selectedRowIndex}`);
    } else {
      console.log(`
        [ColorGenerator] Table initialized/updated, radio button selection unchanged.
        Color count: ${this.colorSelections.length}, Current selected index: ${this.selectedRowIndex}`);
    }

    this.isTableVisible = this.rows > 0 && this.columns > 0 && this.colors > 0;

    this.cdr.detectChanges();
  }

  onColorChange(): void {
    this.cdr.detectChanges(); // force Angular to re-run template bindings
  }
  

  private convertHeaderNumberToLetters(headerNumber: number): string {
    const alphabetSize = 26;
    const asciiOffset = 65;
    let letters = '';

    while (headerNumber >= 0) {
      letters =
        String.fromCharCode((headerNumber % alphabetSize) + asciiOffset) +
        letters;
      headerNumber = Math.floor(headerNumber / alphabetSize) - 1;
    }
    return letters;
  }

  isColorUsed(color: string): boolean {
    return this.colorSelections.includes(color);

  }

  checkColorContrast(color: string, isDisabled: boolean): string { // adjusts some of the hard to see dropdown options
    let textColor = 'white';

    if (['yellow', 'orange'].includes(color)
      || (isDisabled && ['green', 'purple', 'grey', '#8B4513', 'teal'].includes(color))) {
      textColor = 'black';
    }

    return textColor;
  }
  
  public printPage() {
    window.print();
  }

  // get tableColumnWidth(): string {
  //   const colCount = this.columnIndices.length;
  //   return colCount > 27 ? `${1000 / colCount}px` : 'auto';
  // }

  // get tableFontSize(): string {
  //   const colCount = this.columnIndices.length;
  //   let scale = 31.78 / Math.pow(colCount, 1.042);
  //   return colCount > 28 ? `${scale}rem` : '1rem';
  // }

  get printScaleClass(): string {
    const colCount = this.columnIndices.length;
    if (colCount < 40) return 'scale-100';
    if (colCount < 80) return 'scale-75';
    if (colCount < 120) return 'scale-50';
    return 'scale-30';
  }
}
