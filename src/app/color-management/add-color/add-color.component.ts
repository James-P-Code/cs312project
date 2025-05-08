import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Database } from '../../api/database';
import { HttpErrorResponse } from '@angular/common/http';

declare const bootstrap: any;

@Component({
  selector: 'app-add-color',
  imports: [ReactiveFormsModule],
  templateUrl: './add-color.component.html',
  styleUrl: '../color-management.component.css'
})
export class AddColorComponent {
  @ViewChild('successToast', { static: true }) successToast!: ElementRef;
  @Output() colorAdded = new EventEmitter<void>();

  public addColorForm!: FormGroup;
  public addColorSuccess: boolean = false;
  public isSubmitted: boolean = false;
  public isDuplicateColorName: boolean = false;
  public isDuplicateHexValue: boolean = false;
  public addedColorName: string = '';
  public addedColorValue: string = '';

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

    this.addColorForm.markAsPristine();
    this.addColorSuccess = false;
    this.isSubmitted = false;
    this.isDuplicateColorName = false;
    this.isDuplicateHexValue = false;
  }

  public get colorName() {
    return this.addColorForm.get('colorName') as FormControl;
  }

  public reinitializeFormIfNeeded(): void {
    if (this.addColorForm.dirty && this.isSubmitted) {
      this.initializeAddColorForm();
    }
  }

  public onAddColorSubmit(): void { // grace - void
    this.isSubmitted = true;
    if (this.addColorForm.invalid) return;

    let postParams = new Map<string, any>([
        ["colorName", String(this.addColorForm.value.colorName)],
        ["colorValue", String(this.addColorForm.value.colorValue)]
    ]);

    const successCode = 201;

    this.database.postRequest("add", postParams).subscribe({ // grace - changed this section
      next: responseCode => {
        if (responseCode == successCode) {
          this.addColorSuccess = true;
          this.addedColorName = this.addColorForm.value.colorName;
          this.addedColorValue = this.addColorForm.value.colorValue;
          const toast = bootstrap.Toast.getOrCreateInstance(this.successToast.nativeElement);
          toast.show();
          this.colorAdded.emit();
          this.initializeAddColorForm();
        }
      },
      error: (response: HttpErrorResponse) => {
        console.log("Error: " + response.message);
        this.isDuplicateColorName = response.error.message.includes("unique_name");
        this.isDuplicateHexValue = response.error.message.includes("unique_hex_value");
      }
    });
  }
}
