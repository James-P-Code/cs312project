import { Routes } from '@angular/router';
import { ColorComponent } from './color/color.component';
import { AboutComponent } from './about/about.component';
import { ColorManagementComponent }  from './color-management/color-management.component';
import { HomeComponent }  from './home/home.component';


export const routes: Routes = [ 
    { 
        path: '', 
        redirectTo: 'home', // Redirect root path
        pathMatch: 'full' 
    }, 
    {
        path: 'home',
        component: HomeComponent,
        title: 'Home Page'
    },
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
    {
        path: 'color-management',
        component: ColorManagementComponent,
        title: 'Color Management'
    },
];
