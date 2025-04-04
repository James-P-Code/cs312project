import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarItem } from './navbar_item/navbar_item';

@Component({
    selector: 'app-navbar',
    imports: [],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
  })
  export class Navbar {
    constructor(public router: Router) {}

    navBarItems: NavbarItem[] = [
      new NavbarItem('Color Coordinate Generator', 'color')
    ];
  }