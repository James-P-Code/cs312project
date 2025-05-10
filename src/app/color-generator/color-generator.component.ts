import { Component, Input, SimpleChanges, HostListener } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgStyle, NgIf } from '@angular/common';
import { Database } from '../api/database';
import { ContrastChecker } from '../utils/contrast-checker';
import { HttpParams } from '@angular/common/http';
import { pairwise, startWith } from "rxjs/operators";

type ColorFromDatabase = { id: number; name: string; hex_value: string };

@Component({
  selector: 'app-color-generator',
  standalone: true,
  imports: [FormsModule, ScrollingModule, ReactiveFormsModule, NgStyle, NgIf],
  templateUrl: './color-generator.component.html',
  styleUrl: './color-generator.component.css',
})
export class ColorGeneratorComponent {
  @Input() rows: number = 0;
  @Input() columns: number = 0;
  @Input() amountOfColorOptions: number = 0;

  public rowsToDisplay: number[] = [];
  public columnsToDisplay: number[] = [];
  public headerLetters: string[] = [];
  public colorOptions: ColorFromDatabase[] = [];
  public selectedRowIndex: number | null = null;
  public colorSelectionForm: FormGroup = new FormGroup({ colorSelections: new FormArray([]) });
  public isPrinting: boolean = false;
  private tableCellColors: Map<string, ColorFromDatabase | null> = new Map();
  private previouslySelectedColor: ColorFromDatabase | null = null;
  private currentlySelectedColor: ColorFromDatabase | null = null;

  constructor(private database: Database) {}

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['rows'] || changes['columns'] || changes['amountOfColorOptions']) {
      this.initialize();
    }
  }

  private initialize(): void {
    this.rowsToDisplay = new Array(this.rows);
    this.columnsToDisplay = new Array(this.columns);
    this.headerLetters = Array.from({ length: this.columns }, (_, i) =>
      this.convertHeaderNumberToLetters(i)
    );
    this.getColorsFromDatabase();
  }

  private getColorsFromDatabase(): void {
    let httpParams = new HttpParams({ fromObject: { param: 'colors' } });
    this.database.getRequest<ColorFromDatabase[]>(httpParams)
      .subscribe((colors) => {
        this.colorOptions = colors;
        this.setColorSelectionsForm();
      });
  }

  private setColorSelectionsForm(): void {
    this.colorOptionsFormArray.clear();
    for (let i = 0; i < this.amountOfColorOptions; i++) {
      this.colorOptionsFormArray.push(new FormGroup({
        selectedColor: new FormControl(null),
        color: new FormControl<ColorFromDatabase>(this.colorOptions[i])
      }));
    }

    this.colorOptionsFormArray.controls.forEach((colorControl) => {
      colorControl.valueChanges
        .pipe(startWith(colorControl.value), pairwise())
        .subscribe(([previousValue, newValue]) => {
          if (previousValue.color != newValue.color) {
            this.tableCellColors.forEach((cellColor, coord) => {
              if (cellColor?.hex_value === previousValue.color.hex_value) {
                this.tableCellColors.set(coord, newValue.color);
              }
            });
    
          }
        });
    });

    this.removeUnavailableColorsFromTable();

    // Auto-select first color
    if (this.colorOptionsFormArray.length > 0 || this.colorOptionsFormArray.length > 0) {
      const firstGroup = this.colorOptionsFormArray.at(0);
      firstGroup.get('selectedColor')!.setValue(firstGroup.get('color')!.value);
      this.selectedRowIndex = 0;
    }
  }

  private removeUnavailableColorsFromTable(): void {
    let allColorsInForm = new Set(
      this.colorOptionsFormArray.controls
        .map(formControl => formControl.get('color')?.value.id)
    );

    this.tableCellColors.forEach((cellColor, cellCoordinate) => {
      if (!allColorsInForm.has(cellColor?.id)) {
        this.tableCellColors.delete(cellCoordinate);
      }
    });
  }

  public get colorOptionsFormArray(): FormArray {
    return this.colorSelectionForm.get('colorSelections') as FormArray;
  }

  private convertHeaderNumberToLetters(headerNumber: number): string {
    const alphabetSize = 26;
    const asciiOffset = 65;
    let letters = '';

    while (headerNumber >= 0) {
      letters = String.fromCharCode((headerNumber % alphabetSize) + asciiOffset) + letters;
      headerNumber = Math.floor(headerNumber / alphabetSize) - 1;
    }
    return letters;
  }

  public isColorDropDownSelection(color: ColorFromDatabase): boolean {
    return this.colorOptionsFormArray.controls.some(form => form.value.color.name === color.name);
  }

  public adjustColorContrast(backgroundColor: string, isDisabled: boolean = false): string {
    const lightGrey = '#d3d3d3';
    const black = '#000000';
    const white = '#ffffff';
    let textColor = lightGrey;

    if (!isDisabled) {
      let backgroundLuminescence = ContrastChecker.relativeLuminescence(backgroundColor);
      const lumiescenceThreshold = 0.179;
      textColor = backgroundLuminescence > lumiescenceThreshold ? black : white;
    }
    let contrastValue = ContrastChecker.constrastRatio(textColor, backgroundColor);
    const minimumContrast = 4.5;
    return contrastValue < minimumContrast ? black : textColor;
  }

  public updateCurrentlySelectedColor(selectedColor: ColorFromDatabase): void {
    this.currentlySelectedColor = selectedColor;
  }

  public updatePreviouslySelectedColor(oldColor: ColorFromDatabase): void {
    this.previouslySelectedColor = oldColor;
  }

  public updateTableCellColors(): void {
    this.tableCellColors.forEach((color, cellCoordinate) => {
      if (color?.hex_value === this.previouslySelectedColor?.hex_value) {
        this.tableCellColors.set(cellCoordinate, this.currentlySelectedColor);
      }
    });
  }

  public getCellBackgroundColor(cellCoordinates: string): string {
    const defaultColor = "#ffffff";
    return this.tableCellColors.get(cellCoordinates)?.hex_value || defaultColor;
  }

  public getCoordinatesPaintedWithColor(color: string): string {
    return Array.from(this.tableCellColors)
      .filter(([cellCoordinate, cellColor]) => cellColor?.name === color)
      .map(([cellCoordinate]) => cellCoordinate.replace(/\s/g, ""))
      .sort()
      .join(", ");
  }

  public paintTableCell(cellCoordinates: string): void {
    if (this.selectedRowIndex === null) return;
    
    const rg = this.colorOptionsFormArray.at(this.selectedRowIndex);
    const paintColor: ColorFromDatabase = rg.get('color')!.value;

    if (this.tableCellColors.get(cellCoordinates)?.id !== paintColor.id) {
      this.tableCellColors.set(cellCoordinates, paintColor);
    } else {
      this.tableCellColors.delete(cellCoordinates);
    }
  }

  public onSelectRow(i: number) {
    this.selectedRowIndex = i;
  }  

  public isTableCellPainted(cellCoordinate: string): boolean {
    return this.tableCellColors.has(cellCoordinate);
  }

  public printPage(): void {
    this.showModal();
    this.isPrinting = true;
    }

  get printScaleClass(): string {
    const colCount = this.columnsToDisplay.length;
    if (colCount < 40) return 'scale-100';
    if (colCount < 80) return 'scale-75';
    if (colCount < 120) return 'scale-50';
    return 'scale-30';
  }

  @HostListener('window:beforeprint', [])
  onBeforePrint(): void {
    this.isPrinting = true;
  }

  @HostListener('window:afterprint', [])
  onAfterPrint(): void {
    this.isPrinting = false;
  }

  public getTextColorForBackground(hex: string): string {
    if (!hex || hex.length !== 7) return '#000000';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#000000' : '#FFFFFF';
  }

  showPrintReminder = false;

confirmPrint() {
  this.showPrintReminder = false;
  setTimeout(() => {
    window.print();
  }, 100);
}

cancelPrint() {
  this.isPrinting = false;
  this.showPrintReminder = false;
}

  showModal() {
    this.showPrintReminder = true;
  }

}
