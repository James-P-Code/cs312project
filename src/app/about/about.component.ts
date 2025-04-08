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
      'James Pochas',
      'My name is James Pochas and I live in Broomfield, Colorado. I am currently an undergraduate student at Colorado State University pursuing a degree in Computer Science. I love to code and aspire to have a career as a Software Engineer. I am most familiar with Java and C++, and I also have some experience with Python. In my free time I love to explore the outdoors and I hike often.',
      'images/james.png',
      true // This reverses the order of the image and bio in the display for this item
    ),
    new AboutItem(
      'Grace Terrell',
      'My name is Grace Terrell and I am studying Computer Science at Colorado State University. I hope to have a career as a Software Engineer in my future. The programming languages that I am most familiar with are Java, Python, C++, and C. In my free time, I enjoy reading and playing piano.',
      'images/grace.jpg'
    ),
    new AboutItem(
      'Declan McLaughlin',
      'My name is Declan McLaughlin and I am in my final semester of a Computer Science degree. I am working an internship as a Systems Engineer and hope to convert that into a full time position. My favorite programming languages are Java and Python and I started learning PostgreSQL this year. In my free time I like to mountain bike and rock climb with my friends.',
      'images/declan.jpg',
      true // This reverses the order of the image and bio in the display for this item
    ),
    new AboutItem(
      'Grace Terrell',
      'My name is Grace Terrell and I am studying Computer Science at Colorado State University. I hope to have a career as a Software Engineer in my future. The programming languages that I am most familiar with are Java, Python, C++, and C. In my free time, I enjoy reading and playing piano.',
      'images/grace.png'
    )
  ];
}
