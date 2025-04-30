import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Database } from '../../api/database';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-edit-color',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-color.component.html',
  styleUrls: ['./edit-color.component.css']
})
export class EditColorComponent implements OnInit {

  public editColorForm!: FormGroup;
  public allColors: Map<string, string> = new Map();

  public editSuccess = false;
  public editFailure = false;
  public noChanges = false;

  private originalHex = '';
  private originalName = '';

  constructor(private database: Database) {}

  ngOnInit(): void {
    this.loadColors();

    this.editColorForm = new FormGroup({
      colorName: new FormControl('', [Validators.required, Validators.pattern('.*\\S.*')]),
      colorValue: new FormControl('#e26daa', [Validators.required])
    });

    this.editColorForm.get('colorName')?.valueChanges.subscribe(name => {
	  name = name.trim();
      if (this.allColors.has(name)) {
        const hex = this.allColors.get(name)!;
		this.editColorForm.get('colorValue')?.setValue(hex);
        this.originalHex = hex;
		this.originalName = name;
      }	else {
		this.originalHex = '#e26daa';
		this.originalName = '';
	  }
    });
  }

  public loadColors(): void {
    const params = new URLSearchParams();
    params.set('action', 'colors');

    this.database.getRequest<{ name: string, hex: string }[]>(params as any).subscribe({
      next: (colors) => {
        colors.forEach(c => this.allColors.set(c.name, c.hex));
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

    if (!name || !newHex || this.originalHex === newHex) {
      this.noChanges = true;
      return;
    }

    const postParams = new Map<string, string>([
      ['colorName', name],
      ['colorValue', newHex]
    ]);

    this.database.postRequest("edit", postParams).subscribe({
      next: (statusCode) => {
        if (statusCode === 200) {
          this.editSuccess = true;
          this.allColors.set(name, newHex);
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
