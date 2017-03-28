import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Portfolio } from "app/models/portfolio";
import { PortfolioService } from "app/services/portfolio.service";


@Component({
    selector: 'PortfolioDisplayerComponent',
    templateUrl: './component.html',
    styleUrls: ['./styles.css']
})

export class PortfolioDisplayerComponent implements OnInit {
    constructor(public portfolioService: PortfolioService) {
    }

    ngOnInit(): void {
        this.portfolioService.getPorfolioStream()
            .subscribe(portfolio => {
                if (portfolio != null) {
                    this.portfolio = portfolio;
                }
            });
    }

    portfolio: Portfolio;
}
