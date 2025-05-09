import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Database } from '../../api/database';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
	selector: 'app-color-list',
	standalone: true,
	imports: [ReactiveFormsModule, NgStyle],
	templateUrl: './color-list.component.html',
	styleUrls: ['../color-management.component.css']
})
export class ColorListComponent {
	public allColors: { id: number; name: string; hex: string }[] = [];
	public builtInColors: { id: number; name: string; hex: string }[] = [];
	public customColors: { id: number; name: string; hex: string }[] = [];

	constructor(private database: Database) {}

	ngOnInit(): void {
		this.refreshColors();
	}

	public refreshColors(): void {
		const params = new HttpParams().set('param', 'colors');
	
		this.database.getRequest<{ id: string; name: string; hex_value: string }[]>(params).subscribe({
			next: (colors) => {
				this.allColors = colors.map(c => ({
					id: Number(c.id),
					name: c.name,
					hex: c.hex_value
				}));
	
				this.builtInColors = this.allColors.slice(0, 10);
				this.customColors = this.allColors.slice(10);
			},
			error: (error) => {
				console.error('Failed to load color list', error);
			}
		});
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