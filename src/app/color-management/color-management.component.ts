import { Component } from '@angular/core';
import { AddColorComponent } from "./add-color/add-color.component";
import { EditColorComponent } from "./edit-color/edit-color.component";

@Component({
  selector: 'app-color-management',
  imports: [AddColorComponent, EditColorComponent],
  templateUrl: './color-management.component.html',
  styleUrl: './color-management.component.css'
})
export class ColorManagementComponent {}
