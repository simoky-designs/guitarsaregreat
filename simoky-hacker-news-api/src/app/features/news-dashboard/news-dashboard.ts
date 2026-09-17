import { Component, OnInit, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-news-dashboard',
  styleUrl: './news-dashboard.scss',
  templateUrl: './news-dashboard.html',
})
export class NewsDashboard implements OnInit {
  title = signal('simoky-hacker-news-api');

  ngOnInit() {
    this.title.set('hello');
  }
}
