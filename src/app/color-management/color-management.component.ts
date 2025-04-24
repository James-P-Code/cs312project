import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Database } from '../api/database';
import { AddColorComponent } from "./add-color/add-color.component";

@Component({
  selector: 'app-color-management',
  imports: [ReactiveFormsModule, AddColorComponent],
  templateUrl: './color-management.component.html',
  styleUrl: './color-management.component.css'
})
export class ColorManagementComponent {

  public addColorForm!: FormGroup;

  public constructor(private database: Database) {
    this.initializeAddColorForm();
  }

  private initializeAddColorForm() {
    this.addColorForm = new FormGroup({
      colorName: new FormControl('', [Validators.required]),
      colorValue: new FormControl('#e26daa')});
  }

  get addColorFormColorName() {
    return this.addColorForm.get('colorName');
  }

  get addColorFormColorValue() {
    return this.addColorForm.get('colorValue');
  }

  public onAddColorSubmit() {
    let colorName = String(this.addColorForm.value.colorName);
    let colorValue = String(this.addColorForm.value.colorValue);
    this.database.postAddColor(colorName, colorValue).subscribe({
      next: code => {
        // 'code' is a plain number (e.g. 201)
        console.log('Status code:', code);
      },
      error: err => {
        // On error you'll still get HttpErrorResponse
        console.error('Failed with code', err.status);
      }
    });
  }
}
