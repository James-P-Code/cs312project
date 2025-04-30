import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Database } from '../../api/database';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-edit-color',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-color.component.html',
  styleUrls: ['./edit-color.component.css']
})
export class EditColorComponent implements OnInit {

  public editColorForm!: FormGroup;
  public allColors: Map<string, { id: number; hex: string }> = new Map();

  public editSuccess = false;
  public editFailure = false;
  public noChanges = false;

  private originalHex = '';
  private originalName = '';
  private originalId = -1;

  constructor(private database: Database) {}

  ngOnInit(): void {
    this.loadColors();

    this.editColorForm = new FormGroup({
      colorName: new FormControl('', [Validators.required, Validators.pattern('.*\\S.*')]),
      colorValue: new FormControl('#e26daa', [Validators.required])
    });

    this.editColorForm.get('colorName')?.valueChanges.subscribe(name => {
      name = name.trim();
      const data = this.allColors.get(name);
      if (data) {
        this.editColorForm.get('colorValue')?.setValue(data.hex);
        this.originalHex = data.hex;
        this.originalName = name;
        this.originalId = data.id;
      } else {
        this.originalHex = '#e26daa';
        this.originalName = '';
        this.originalId = -1;
      }
    });
  }

  public loadColors(): void {
    const params = new HttpParams().set('param', 'colors');
  
    this.database.getRequest<{ id: number, name: string, hex_value: string }[]>(params).subscribe({
      next: (colors) => {
        this.allColors.clear();
        colors.forEach(c => this.allColors.set(c.name, { id: c.id, hex: c.hex_value }));
      },
      error: (err) => console.error('Error fetching colors', err)
    });
  }
  

  public onEditColorSubmit(): void {
    this.editSuccess = false;
    this.editFailure = false;
    this.noChanges = false;
  
    const name = this.editColorForm.value.colorName.trim();
    const newHex = this.editColorForm.value.colorValue.trim();
  
    if (!name || !newHex) return;
  
    if (name === this.originalName && newHex === this.originalHex) {
      this.noChanges = true;
      return;
    }
  
    // const nameConflict = [...this.allColors.entries()].some(([otherName, data]) =>
    //   name === otherName
    // );
    
    // const hexConflict = [...this.allColors.entries()].some(([_, data]) =>
    //   data.hex.toLowerCase() === newHex.toLowerCase() && data.id !== this.originalId
    // );    
    
    // if (nameConflict || hexConflict) {
    //   this.editFailure = true;
    //   return;
    // }
  
    const colorId = this.originalId;
  
    const postParams = new Map<string, string>([
      ['colorName', name],
      ['colorValue', newHex],
      ['id', String(colorId)]
    ]);
  
    this.database.postRequest("edit", postParams).subscribe({
      next: (statusCode) => {
        if (statusCode === 200) {
          this.editSuccess = true;
          this.allColors.set(name, { id: colorId, hex: newHex });
          this.originalHex = newHex;
          this.originalName = name;
        } else {
          this.editFailure = true;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error("Edit error", error);
        this.editFailure = true;
      }
    });
  }
  
}
