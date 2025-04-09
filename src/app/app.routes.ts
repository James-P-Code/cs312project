import { Routes } from '@angular/router';
import { ColorComponent } from './color/color.component';
import { AboutComponent } from './about/about.component';


export const routes: Routes = [
    { 
        path: '', 
        redirectTo: '/color', // Redirect root path
        pathMatch: 'full' }, 
    {
        path: 'color',
        component: ColorComponent,
        title: 'Color Coordinate Generator'
    },
    {
        path: 'about',
        component: AboutComponent,
        title: 'About'
    },
];
