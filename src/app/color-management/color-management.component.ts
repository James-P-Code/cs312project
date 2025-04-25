import { Component } from '@angular/core';
import { AddColorComponent } from "./add-color/add-color.component";

@Component({
  selector: 'app-color-management',
  imports: [AddColorComponent],
  templateUrl: './color-management.component.html',
  styleUrl: './color-management.component.css'
})
export class ColorManagementComponent {}
