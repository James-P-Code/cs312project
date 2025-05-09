import { Component, ViewChild } from '@angular/core';
import { ColorListComponent } from "./color-list/color-list.component";
import { AddColorComponent } from "./add-color/add-color.component";
import { EditColorComponent } from "./edit-color/edit-color.component";
import { DeleteColorComponent } from "./delete-color/delete-color.component";

@Component({
  selector: 'app-color-management',
  imports: [ColorListComponent, AddColorComponent, EditColorComponent, DeleteColorComponent],
  templateUrl: './color-management.component.html',
  styleUrl: './color-management.component.css'
})

export class ColorManagementComponent {
  @ViewChild('colorList') colorListComponent!: ColorListComponent;
  @ViewChild('add') addColorComponent!: AddColorComponent;
  @ViewChild('edit') editColorComponent!: EditColorComponent;
  @ViewChild('delete') deleteColorComponent!: DeleteColorComponent;

  public onColorAdded() {
    this.editColorComponent.initializeEditColorForm();
    this.deleteColorComponent.initializeDeleteColorForm();
    this.colorListComponent.refreshColors();
  }

  public onColorEdited() {
    this.deleteColorComponent.initializeDeleteColorForm();
    this.colorListComponent.refreshColors();
  }

  public onColorDeleted() {
    this.editColorComponent.initializeEditColorForm();
    this.colorListComponent.refreshColors();
  }
}
