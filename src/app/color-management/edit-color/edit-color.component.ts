import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Database } from '../../api/database';
import { NgStyle } from '@angular/common';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ContrastChecker } from '../../utils/contrast-checker';

type ColorFromDatabase = { id: number; name: string; hex_value: string };
declare const bootstrap: any;

@Component({
  selector: 'app-edit-color',
  imports: [ReactiveFormsModule, NgStyle],
  templateUrl: './edit-color.component.html',
  styleUrls: ['../color-management.component.css']
})
export class EditColorComponent {
  @ViewChild('editSuccessToast', { static: true }) successToast!: ElementRef;
  @Output() colorEdited = new EventEmitter<void>();

  ngAfterViewInit() {
    this.toast = bootstrap.Toast.getOrCreateInstance(this.successToast.nativeElement);
  }

  public editColorForm = new FormGroup({
    selectedId: new FormControl(),    
    colorName: new FormControl('', [
      Validators.required, 
      Validators.pattern('.*\\S.*')]), // for a string of blank spaces            
    colorValue: new FormControl('#e26daa')        
  });   

  public allColorsFromDatabase: Array<ColorFromDatabase> = [];
  public editSuccess = false;
  public isDuplicateName = false;
  public isDuplicateHexValue = false;
  public isSubmitted = false;
  public oldColorName: string = '';
  public oldColorValue: string = '';
  public newColorName: string = '';
  public newColorValue: string = '';
  private toast: any;

  constructor(private database: Database) {
    this.initializeEditColorForm();
  }

  public initializeEditColorForm() {
    this.loadColors();

    this.selectedId.valueChanges.subscribe(id => {
      const color = this.allColorsFromDatabase.find(c => c.id === id);
      if (color) {
        this.colorName.setValue(color.name);
        this.colorValue.setValue(color.hex_value);
        this.oldColorName = color.name;
        this.oldColorValue = color.hex_value;
        this.editColorForm.markAsPristine();
      } else {
        this.colorName.setValue('');
        this.colorValue.setValue('#e26daa');
      }
    });

    this.editColorForm.markAsPristine();
    this.editSuccess = false;
    this.isDuplicateName = false;
    this.isDuplicateHexValue = false;
    this.isSubmitted = false;
    this.oldColorName = this.colorName.value;
    this.oldColorValue = this.colorValue.value;
    this.newColorName = '';
    this.newColorValue = '';
  }

  public loadColors(): void {
    const params = new HttpParams().set('param', 'colors');
  
    this.database.getRequest<ColorFromDatabase[]>(params).subscribe({
      next: (colors) => {
        this.allColorsFromDatabase = colors.slice(10);
      },
      error: (err) => console.error('Error fetching colors', err)
    });
  }

  get selectedId() {
    return this.editColorForm.get('selectedId') as FormControl;
  }

  get colorName() {
    return this.editColorForm.get('colorName') as FormControl;
  }

  get colorValue() {
    return this.editColorForm.get('colorValue') as FormControl;
  }

  public reinitializeFormIfNeeded(): void {
    if (this.isSubmitted && (this.editColorForm.dirty || this.editColorForm.touched)) {
      this.initializeEditColorForm();
    }

    if (this.toast) this.toast.hide();
  }

  public onEditColorSubmit(): void {
    this.editSuccess = false;
    this.isSubmitted = true;

    const inputName = this.colorName.value;
    const trimmedName = inputName.trim() || '';
    this.colorName.setValue(trimmedName);

    if (this.editColorForm.invalid) return;
  
    const postParams = new Map<string, any>([
      ['colorName',  trimmedName],
      ['colorValue', this.colorValue.value],
      ['id', Number(this.selectedId.value)]
    ]);

    const postSuccess = 201;
    this.database.postRequest("edit", postParams).subscribe({
      next: (statusCode) => {
        this.editSuccess = statusCode === postSuccess;
        this.newColorName = trimmedName;
        this.newColorValue = this.colorValue.value;
        this.toast.show();
        this.colorEdited.emit();
        this.editColorForm.reset({
          selectedId: null,
          colorName: '',
          colorValue: '#e26daa'
        });
        setTimeout(() => {
          this.editSuccess = false;
        }
        , 5000);
      },
      error: (response: HttpErrorResponse) => {
        this.isDuplicateName = response.error.message.includes("unique_name");
        this.isDuplicateHexValue = response.error.message.includes("unique_hex_value");
        console.log("Edit error", response.error.message);
      }
    });
  }

  public getSelectedHex(): string {
    const selectedId = this.selectedId?.value;
    const match = this.allColorsFromDatabase.find(c => c.id === selectedId);
    return match?.hex_value ?? '#ffffff';
  }
  
  public getTextColorForBackground(hex: string): string {
    if (!hex || hex.length !== 7) return '#000000';

    const lumiescenceThreshold = 0.6;
    return ContrastChecker.relativeLuminescence(hex) > lumiescenceThreshold ? '#000000' : '#FFFFFF';

  }
  
}
