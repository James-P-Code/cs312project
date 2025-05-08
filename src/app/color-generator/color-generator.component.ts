import {
  Component,
  Input,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Database } from '../api/database';
import { ContrastChecker } from '../utils/contrast-checker';
import { HttpParams } from '@angular/common/http';
import { find, first, map } from 'rxjs';

type ColorFromDatabase = { id: number; name: string; hex_value: string };

@Component({
  selector: 'app-color-generator',
  standalone: true,
  imports: [NgStyle, FormsModule, ScrollingModule],
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

  public colorOptions: { label: string; value: string }[] = [];

  public selectedRowIndex: number | null = null;
  public colorSelections: string[] = [];

  constructor(private cdr: ChangeDetectorRef, private database: Database) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['rows'] || changes['columns'] || changes['colors']) {
      this.initializeTable();
    }

    document.addEventListener('DOMContentLoaded', () => {
      const coordinateTable = document.querySelector('#coordinate-table') as HTMLElement;
      coordinateTable!.style.display = 'inline';
    });
  }

  private initializeTable() {
    this.rowIndices = new Array(this.rows);
    this.columnIndices = new Array(this.columns);

    this.headerLetters = Array.from({ length: this.columns }, (_, i) =>
      this.convertHeaderNumberToLetters(i)
    );

    this.getColorsFromDatabase();

    // Ensure the selection resets if the current index is invalid after regeneration
    if (this.colorSelections.length > 0 &&
        (this.selectedRowIndex === null || this.selectedRowIndex >= this.colorSelections.length)) {
      this.selectedRowIndex = 0;
      console.log('[ColorGenerator] Selected index reset to first option due to omitted selection.');
    }

    this.isTableVisible = this.rows > 0 && this.columns > 0 && this.colors > 0;
  }

  private getColorsFromDatabase(): void {
    let httpParams = new HttpParams({ fromObject: { param: 'colors' } });
    this.database
      .getRequest<ColorFromDatabase[]>(httpParams)
      .subscribe((colors) => {
        this.setColorOptions(colors);
      });
  }

  private setColorOptions(colors: ColorFromDatabase[]) {
    this.colorOptions = colors.map((color) => ({
      label: color.name,
      value: color.hex_value,
    }));

    this.colorSelections = Array.from(
      { length: this.colors },
      (_, i) => this.colorOptions[i % this.colorOptions.length].value
    );

    // Reset selection here too in case options changed
    if (this.colorSelections.length > 0 &&
        (this.selectedRowIndex === null || this.selectedRowIndex >= this.colorSelections.length)) {
      this.selectedRowIndex = 0;
      console.log('[ColorGenerator] Selected index reset to first option after fetching colors.');
    }

    this.onColorChange();
  }

  private onColorChange(): void {
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

  checkColorContrast(backgroundColor: string, isDisabled: boolean): string {
    // adjusts the color dropdown selection text based on disabled state and background color
    let textColor = '';

    // set the initial text color
    if (isDisabled) {
      // light grey if selection option is disabled
      textColor = '#D3D3D3';
    } else {
      // otherwise set the initial color based on the background
      let backgroundLuminescence =
        ContrastChecker.relativeLuminescence(backgroundColor);
      const lumiescenceThreshold = 0.179;
      textColor =
        backgroundLuminescence > lumiescenceThreshold ? '#000000' : '#FFFFFF';
    }

    // check the contrast of the initial text color vs the background
    let contrastValue = ContrastChecker.constrastRatio(
      textColor,
      backgroundColor
    );
    const minimumContrast = 4.5;

    if (contrastValue < minimumContrast) {
      textColor = '#000000';
    }

    this.paintColorFromHashMap(this.colorSelectionMap);

    return textColor;
  }

  private setDropDownTextColor(backgroundColor: string) {
    let backgroundLuminescence =
      ContrastChecker.relativeLuminescence(backgroundColor);
    const lumiescenceThreshold = 0.179;
    return backgroundLuminescence > lumiescenceThreshold
      ? '#000000'
      : '#FFFFFF';
  }

  public printPage() {
    this.isPrinting = true;
    this.paintColorFromHashMap(this.colorSelectionMap);

    setTimeout(() => {
      window.print();
    }, 100);
  }

  get printScaleClass(): string {
    const colCount = this.columnIndices.length;
    if (colCount < 40) return 'scale-100';
    if (colCount < 80) return 'scale-75';
    if (colCount < 120) return 'scale-50';
    return 'scale-30';
  }

  isPrinting = false;

  @HostListener('window:beforeprint', [])
  onBeforePrint() {
    this.isPrinting = true;
    this.paintColorFromHashMap(this.colorSelectionMap);
  }

  @HostListener('window:afterprint', [])
  onAfterPrint() {
    this.isPrinting = false;
  }

  revealedCoordinates = new Set<string>();

  colorSelectionMap: SelectionHashMap = {};

  onCellClick(row: number, col: number) {
    const coord = `${row},${col}`;
    if (this.revealedCoordinates.has(coord)) {
      this.revealedCoordinates.delete(coord);
    } else {
      this.revealedCoordinates.add(coord);
    }

    if (!this.colorSelectionMap[this.selectedRowIndex!]) {
      this.colorSelectionMap[this.selectedRowIndex!] = [];
    }

    if (!this.isCoordinateInHashMap(coord)) {
      if (
        this.colorSelectionMap[this.selectedRowIndex!].indexOf(coord) === -1
      ) {
        this.colorSelectionMap[this.selectedRowIndex!].push(coord);
      }
    } else {
      this.removeCoordinateFromList(coord);
    }

    this.updateColorCoordinates(this.colorSelectionMap);
    this.paintColorFromHashMap(this.colorSelectionMap);
  }

  public isCoordinateInHashMap(coord: string): boolean {
    for (const key of Object.keys(this.colorSelectionMap)) {
      const coordIndex = this.colorSelectionMap[key].indexOf(coord);
      if (coordIndex !== -1) {
        return true;
      }
    }
    return false;
  }

  public findColorCoordinateIndex(coord: string): number {
    for (const key of Object.keys(this.colorSelectionMap)) {
      const coordIndex = this.colorSelectionMap[key].indexOf(coord);
      if (coordIndex !== -1) {
        return parseInt(key);
      }
    }
    return -1;
  }

  public formatCoord(coord: string): string {
    return (
      this.headerLetters[parseInt(coord.split(',')[1])] +
      (parseInt(coord.split(',')[0]) + 1).toString()
    );
  }

  public removeCoordinateFromList(coord: string | null) {
    if (coord === null) return;
    console.log(`Removing coordinate from list: ${this.formatCoord(coord)} `);
    const elements = document.getElementsByClassName(this.formatCoord(coord));
    Array.from(elements).forEach((element) => {
      (element as HTMLElement).style.backgroundColor = 'white';
    });
    let coordIndex = this.findColorCoordinateIndex(coord);
    this.colorSelectionMap[coordIndex].splice(
      this.colorSelectionMap[coordIndex].indexOf(coord),
      1
    );
  }

  private updateColorCoordinates(selectionHashMap: SelectionHashMap) {
    for (const key of Object.keys(selectionHashMap)) {
      const rowElement = document.getElementById(`color-select-row-${parseInt(key)}`);
      if (rowElement) {
        const secondColumnCell = rowElement.querySelector(`td:nth-child(2)`) as HTMLElement;
        if (secondColumnCell) {
          secondColumnCell.textContent = '';
          const coordText = selectionHashMap[key]
            .map((x: string) => this.formatCoord(x))
            .join(', ');
          if (coordText) {
            this.generateColorCoordinatesList(secondColumnCell, coordText + '\u00A0\u00A0');
          } else {
            secondColumnCell.textContent = '';
          }
        }
      }
    }
  }

  isRevealed(row: number, col: number): boolean {
    return this.revealedCoordinates.has(`${row},${col}`);
  }

  generateColorCoordinatesList(
    secondColumnCell: HTMLElement,
    coordText: string
  ) {
    secondColumnCell.textContent = coordText;
  }

  paintColorFromHashMap(selectionHashMap: SelectionHashMap): void {
    this.clearGridColor();
    Object.keys(selectionHashMap).forEach((key) => {
      const rowElement = document.getElementById(`color-select-row-${parseInt(key)}`);
      if (!rowElement) return;

      const secondColumnCell = rowElement.querySelector(`td:nth-child(2)`) as HTMLElement;
      const firstColumnCell = rowElement.querySelector(`td:nth-child(1)`) as HTMLElement;

      if (!secondColumnCell || !firstColumnCell) return;

      const columnColor = (
        firstColumnCell.children[0].children[1].children[1] as HTMLElement
      ).style.backgroundColor;

      console.log(
        `Painting: ${secondColumnCell.textContent} with color: ${columnColor}`
      );

      secondColumnCell.textContent?.split(',').forEach((coordinate) => {
        Array.from(document.getElementsByClassName(coordinate.trim())).forEach(
          (element) => {
            (element as HTMLElement).style.backgroundColor = columnColor;
          }
        );
      });
    });
  }

  clearGridColor() {}
}

interface SelectionHashMap {
  [rowId: string]: Array<string>;
}
