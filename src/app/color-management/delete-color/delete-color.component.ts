import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Database } from '../../api/database';

declare const bootstrap: any;

@Component({
  selector: 'app-delete-color',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgStyle],
  templateUrl: './delete-color.component.html',
  styleUrls: ['../color-management.component.css']
})
export class DeleteColorComponent implements OnInit {
  @ViewChild('deleteSuccessToast', { static: true }) successToast!: ElementRef;
  @Output() colorDeleted = new EventEmitter<void>();

  ngAfterViewInit() {
    this.toast = bootstrap.Toast.getOrCreateInstance(this.successToast.nativeElement);
  }

  public deleteColorForm!: FormGroup;

  public deleteSuccess: boolean = false;
  public deleteFailure: boolean = false;
  public notEnoughColors: boolean = false;
  public deletedColorName: string = '';
  public deletedColorValue: string = '';
  public isSubmitted: boolean = false;
  private toast: any;

  public allColors: Map<string, { id: number; hex: string }> = new Map();
  public allColorsArray: { name: string; id: number; hex: string }[] = [];
  public colorDropdownOptions: { label: string; value: string }[] = [];

  constructor(private fb: FormBuilder, private database: Database) {}

  ngOnInit(): void {
    this.initializeDeleteColorForm();
  }

  public initializeDeleteColorForm(): void {
    this.deleteColorForm = this.fb.group({
      selectedId: ['', Validators.required],
      confirmDelete: [false]
    });

    this.deleteColorForm.markAsPristine();
    this.deletedColorName = '';
    this.deletedColorValue = '';
    this.isSubmitted = false;
    this.loadColors();
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
    this.isSubmitted = true;

	// const confirmed = this.deleteColorForm.get('confirmDelete')?.value;
  //   if (!confirmed) {
  //     this.confirmDeleteError = true;
  //     return;
  //   }

    if (this.allColorsArray.length <= 2) {
      this.notEnoughColors = true;
      return;
    }

    const selectedId = +this.deleteColorForm.value.selectedColor;
    this.deletedColorName = this.allColorsArray.find(color => color.id === selectedId)!.name;
    this.deletedColorValue = this.allColorsArray.find(color => color.id === selectedId)!.hex;

    const postParams = new Map<string, any>([
      ['action', 'delete'],
      ['id', selectedId]
    ]);

    this.database.postRequest('delete', postParams).subscribe({
      next: (statusCode: number) => {
        if (statusCode === 201) {
          this.deleteSuccess = true;
          this.removeColorById(selectedId);
          this.toast.show();
          this.colorDeleted.emit();
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
        label: color.name,
        value: color.id.toString()
      }));
    }
  }

  private resetFlags(): void {
    this.deleteSuccess = false;
    this.deleteFailure = false;
    this.notEnoughColors = false;
	// this.confirmDeleteError = false;
  }

  public getTextColorForBackground(hex: string): string {
    if (!hex || hex.length !== 7) return '#000000';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#000000' : '#FFFFFF';
  }

  public reinitializeFormIfNeeded(): void {
    if (this.isSubmitted && (this.deleteColorForm.dirty || this.deleteColorForm.touched)) {
      this.initializeDeleteColorForm();
    }

    if (this.toast) this.toast.hide();
  }

  get selectedId() {
    return this.deleteColorForm.get('selectedId') as FormControl;
  }  
}
