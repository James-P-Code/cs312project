import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ColorGeneratorComponent } from "../color-generator/color-generator.component";
import { Database } from '../api/database';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-color',
  imports: [ReactiveFormsModule, ColorGeneratorComponent],
  templateUrl: './color.component.html',
  styleUrl: './color.component.css'
})

export class ColorComponent {

  public numberOfColorsInDatabase!: number;
  public rowsColumnsColorsForm = new FormGroup({
    rows: new FormControl('', 
              [Validators.required, 
              Validators.min(1), 
              Validators.max(1000),
              Validators.pattern('\\d+')]),
    columns: new FormControl('',
              [Validators.required, 
               Validators.min(1), 
               Validators.max(702),
               Validators.pattern('\\d+')]),
    colors: new FormControl('', 
              [Validators.required,
                Validators.min(1),
                Validators.pattern('\\d+')])
  });

  constructor(private database: Database) {
    let httpParams = new HttpParams({ fromObject: {param: "count"} });
    this.database.getRequest<{count: number}>(httpParams).subscribe(colors => {
      this.numberOfColorsInDatabase = colors.count;
      const colorsControl = this.rowsColumnsColorsForm.controls.colors;
      colorsControl.addValidators(Validators.max(this.numberOfColorsInDatabase));
    })
  }

  get rows() {
    return this.rowsColumnsColorsForm.get('rows');
  }

  get columns() {
    return this.rowsColumnsColorsForm.get('columns');
  }

  get colors() {
    return this.rowsColumnsColorsForm.get('colors');
  }

  formSubmitted = false;
  numberOfRows: number | null = null;
  numberOfColumns: number | null = null;
  numberOfColors: number | null = null;

  onSubmit() {
    if (this.rowsColumnsColorsForm.valid) {
      this.formSubmitted = true;
      this.numberOfRows = Number(this.rowsColumnsColorsForm.value.rows);
      this.numberOfColumns = Number(this.rowsColumnsColorsForm.value.columns);
      this.numberOfColors = Number(this.rowsColumnsColorsForm.value.colors);
    }
  }
}
