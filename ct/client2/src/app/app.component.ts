import { Component, OnInit } from '@angular/core';
import { PortfolioService } from "app/services/portfolio.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(public portfolioService: PortfolioService) {

  }

  ngOnInit(): void {
    this.portfolioService.initialise();
  }

  title = 'Credit tool';
}
