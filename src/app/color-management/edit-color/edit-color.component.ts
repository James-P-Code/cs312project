import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Database } from '../../api/database';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';

type ColorFromDatabase = { id: number; name: string; hex_value: string };

@Component({
  selector: 'app-edit-color',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-color.component.html',
  styleUrls: ['./edit-color.component.css']
})
export class EditColorComponent implements OnInit {

  public editColorForm = new FormGroup({
    selectedId: new FormControl(),    
    colorName: new FormControl('', [
      Validators.required, 
      Validators.pattern('.*\\S.*')]), // for a string of blank spaces            
    colorValue: new FormControl('#000000')        
  });   
  public allColorsFromDatabase: Array<ColorFromDatabase> = [];

  public editSuccess = false;
  public isDuplicateName = false;
  public isDuplicateHexValue = false;

  public selectedColorName = '';
  public selectedColorHexValue = '';

  constructor(private database: Database) {}

  ngOnInit(): void {
    this.loadColors();

    this.selectedId.valueChanges.subscribe(id => {
      const color = this.allColorsFromDatabase.find(c => c.id === id);
      if (color) {
        this.colorName.setValue(color.name);
        this.colorValue.setValue(color.hex_value);
        this.editColorForm.markAsPristine();
      }
    });
  }

  public loadColors(): void {
    const params = new HttpParams().set('param', 'colors');
  
    this.database.getRequest<ColorFromDatabase[]>(params).subscribe({
      next: (colors) => {
        this.allColorsFromDatabase = colors;
        const initialSelection = this.allColorsFromDatabase[0];
        this.selectedId.setValue(initialSelection.id); 
        this.colorName.setValue(initialSelection.name);
        this.colorValue.setValue(initialSelection.hex_value);
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


  public onEditColorSubmit(): void {
    this.editSuccess = false;
  
    const postParams = new Map<string, any>([
      ['colorName',  this.colorName.value],
      ['colorValue', this.colorValue.value],
      ['id', Number(this.selectedId.value)]
    ]);

    const postSuccess = 201;
    this.database.postRequest("edit", postParams).subscribe({
      next: (statusCode) => {
        this.editSuccess = statusCode === postSuccess;
      },
      error: (response: HttpErrorResponse) => {
        this.isDuplicateName = response.error.message.includes("unique_name");
        this.isDuplicateHexValue = response.error.message.includes("unique_hex_value");
        console.error("Edit error", response.error.message);
      }
    });
  }
}
