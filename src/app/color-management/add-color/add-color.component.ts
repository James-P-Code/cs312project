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

  public constructor(private database: Database) {
    this.initializeAddColorForm();
  }

  private initializeAddColorForm() {
    this.addColorForm = new FormGroup({
      colorName: new FormControl('', [
        Validators.required, 
        Validators.pattern('.*\\S.*')]),
      colorValue: new FormControl('#e26daa', [
        Validators.required // grace - validators required
      ])});
  }

  get addColorFormColorName() {
    return this.addColorForm.get('colorName');
  }

  get addColorFormColorValue() {
    return this.addColorForm.get('colorValue');
  }

  public onAddColorSubmit(): void { // grace - void
    this.addColorSuccess = false; // grace - added these next few lines
    this.addColorFailure = false;

    if (this.addColorForm.invalid) return;

    const successCode = 201;

    let postParams = new Map<string, any>([
        ["colorName", String(this.addColorForm.value.colorName)],
        ["colorValue", String(this.addColorForm.value.colorValue)]
    ]);

    this.database.postRequest("add", postParams).subscribe({ // grace - changed this section
      next: responseCode => {
        if (responseCode == successCode) {
          this.addColorSuccess = true;
          this.addColorForm.reset({ colorValue: '#e26daa' });
        } else {
          this.addColorFailure = true;
        }
        // console.log("Response code: " + responseCode);
        // responseCode == successCode ? this.addColorSuccess = true : this.addColorFailure = true;
      },
      error: (errorResponse: HttpErrorResponse) => {
        console.log("Error: " + errorResponse.message);
        this.addColorFailure = true;
      }
    });
  }
}
