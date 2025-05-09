import { Component, Input, SimpleChanges, HostListener } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Database } from '../api/database';
import { ContrastChecker } from '../utils/contrast-checker';
import { HttpParams } from '@angular/common/http';
import { pairwise, startWith } from "rxjs/operators";

type ColorFromDatabase = { id: number; name: string; hex_value: string };

@Component({
  selector: 'app-color-generator',
  standalone: true,
  imports: [FormsModule, ScrollingModule, ReactiveFormsModule],
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
  public colorSelectionForm: FormGroup = new FormGroup ({ colorSelections: new FormArray([]) });
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
      }))
    }

    this.colorOptionsFormArray.controls.forEach((colorControl) => {
      colorControl.valueChanges
        .pipe(startWith(colorControl.value), pairwise())
        .subscribe(([previousValue, newValue]) => {
          if (previousValue.color != newValue.color) {
            this.previouslySelectedColor = previousValue.color;
            this.currentlySelectedColor = newValue.color;
          }
        })
    })
    this.removeUnavailableColorsFromTable();
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
    })
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
    const white = '#ffffff'
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
    })
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
    if (this.tableCellColors.get(cellCoordinates) != this.currentlySelectedColor) {
      this.tableCellColors.set(cellCoordinates, this.currentlySelectedColor);
    } else {
      this.tableCellColors.delete(cellCoordinates);
    }
  }

  public isTableCellPainted(cellCoordinate: string): boolean {
    return this.tableCellColors.has(cellCoordinate);
  }

  public printPage() {
    this.isPrinting = true;

    setTimeout(() => {
      window.print();
    }, 100);
  }

  get printScaleClass(): string {
    const colCount = this.columnsToDisplay.length;
    if (colCount < 40) return 'scale-100';
    if (colCount < 80) return 'scale-75';
    if (colCount < 120) return 'scale-50';
    return 'scale-30';
  }

  @HostListener('window:beforeprint', [])
  onBeforePrint() {
    this.isPrinting = true;
  }

  @HostListener('window:afterprint', [])
  onAfterPrint() {
    this.isPrinting = false;
  }
}
