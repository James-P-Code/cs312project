import { Component } from '@angular/core';
import { AboutItem } from './about_item/about_item';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  aboutItems: AboutItem[] = [
    new AboutItem(
      'Rose Ordway',
      "Hi, I am Rose Ordway! I'm a passionate coder and educator with over 10 years of experience teaching coding. My love for technology started in childhood and has grown into a lifelong journey! Minecraft played a huge role in kickstarting my career, teaching me how to code mods and opening the door to my first job. Beyond coding, I’m deeply committed to trans rights activism. I serve on a board for Denver Health, advocating for inclusive and affirming health care access for the trans community. Teaching is at the heart of everything I do. I currently work as a substitute teacher and am working toward becoming a full-time high school coding or robotics teacher, with a strong focus on STEM education.",
      'images/rose.JPEG'
    ),
    new AboutItem(
      'Rose Ordway',
      "Hi, I am Rose Ordway! I'm a passionate coder and educator with over 10 years of experience teaching coding. My love for technology started in childhood and has grown into a lifelong journey! Minecraft played a huge role in kickstarting my career, teaching me how to code mods and opening the door to my first job. Beyond coding, I’m deeply committed to trans rights activism. I serve on a board for Denver Health, advocating for inclusive and affirming health care access for the trans community. Teaching is at the heart of everything I do. I currently work as a substitute teacher and am working toward becoming a full-time high school coding or robotics teacher, with a strong focus on STEM education.",
      'images/rose.JPEG'
    ),
  ];
}
