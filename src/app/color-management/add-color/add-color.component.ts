import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Database } from '../../api/database';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-color',
  imports: [ReactiveFormsModule],
  templateUrl: './add-color.component.html',
  styleUrl: './add-color.component.css'
})
export class AddColorComponent {

  public addColorForm!: FormGroup;
  public addColorSuccess: boolean = false;
  public addColorFailure: boolean = false;
  public addColorDuplicateName: boolean = false;
  public addColorDuplicateHexValue: boolean = false;

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
        this.checkResponseCode(code);
        console.log("Response Code " + code);
      },
      error: (err: HttpErrorResponse) => {
        console.log("Error: " + err.status);
        this.addColorFailure = true;
      }
    });
  }

  private checkResponseCode(code: number) {
    const successCode: number = 201;
    const duplicateName: number = 409;
    const duplcateHexValue: number = 422;

    switch(code) {
      case successCode: this.addColorSuccess = true; break;
      case duplicateName: this.addColorDuplicateName = true; break;
      case duplcateHexValue: this.addColorDuplicateHexValue = true; break;
      default: this.addColorFailure = true;
    }
  }
}
