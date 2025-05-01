import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Database } from '../../api/database';

@Component({
  selector: 'app-delete-color',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgStyle],
  templateUrl: './delete-color.component.html',
  styleUrls: ['./delete-color.component.css']
})
export class DeleteColorComponent implements OnInit {

  public deleteColorForm!: FormGroup;

  public deleteSuccess: boolean = false;
  public deleteFailure: boolean = false;
  public notEnoughColors: boolean = false;

  public allColors: Map<string, { id: number; hex: string }> = new Map();
  public allColorsArray: { name: string; id: number; hex: string }[] = [];
  public colorDropdownOptions: { label: string; value: string }[] = [];

  constructor(private fb: FormBuilder, private database: Database) {}

  ngOnInit(): void {
    this.initializeDeleteColorForm();
    this.loadColors();
  }

  private initializeDeleteColorForm(): void {
    this.deleteColorForm = this.fb.group({
      selectedColor: ['', Validators.required],
      confirmDelete: [false, Validators.requiredTrue]
    });
  }

  public loadColors(): void {
    const params = new HttpParams().set('param', 'colors');

    this.database.getRequest<{ id: string; name: string; hex_value: string }[]>(params).subscribe({
      next: (colors) => {
        this.allColors.clear();
        this.allColorsArray = colors.map(color => ({
          id: Number(color.id),
          name: color.name,
          hex: color.hex_value
        }));
        for (const color of this.allColorsArray) {
          this.allColors.set(color.name, { id: color.id, hex: color.hex });
        }

        this.colorDropdownOptions = this.allColorsArray.map((color) => ({
          label: color.name,
          value: color.id.toString()
        }));
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load colors', err);
      }
    });
  }

  public getSelectedHex(): string {
	const selectedId = this.deleteColorForm?.value?.selectedColor;
	const match = this.allColorsArray.find(c => c.id.toString() === selectedId);
	return match?.hex ?? '#ffffff';
	}

  public onDeleteColorSubmit(): void {
    this.resetFlags();

    if (this.allColorsArray.length <= 2) {
      this.notEnoughColors = true;
      return;
    }

    const selectedId = +this.deleteColorForm.value.selectedColor;

    const postParams = new Map<string, any>([
      ['action', 'delete'],
      ['id', selectedId]
    ]);

    this.database.postRequest('delete', postParams).subscribe({
      next: (statusCode: number) => {
        if (statusCode === 201) {
          this.deleteSuccess = true;
          this.removeColorById(selectedId);
          this.deleteColorForm.reset();
        } else {
          this.deleteFailure = true;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Delete error:', error);
        this.deleteFailure = true;
      }
    });
  }

  private removeColorById(id: number): void {
    const index = this.allColorsArray.findIndex(color => color.id === id);
    if (index !== -1) {
      const nameToRemove = this.allColorsArray[index].name;
      this.allColorsArray.splice(index, 1);
      this.allColors.delete(nameToRemove);
      this.colorDropdownOptions = this.allColorsArray.map((color) => ({
        label: `${color.name} (${color.hex})`,
        value: color.id.toString()
      }));
    }
  }

  private resetFlags(): void {
    this.deleteSuccess = false;
    this.deleteFailure = false;
    this.notEnoughColors = false;
  }

  public getTextColorForBackground(hex: string): string {
    if (!hex || hex.length !== 7) return '#000000';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#000000' : '#FFFFFF';
  }
}
