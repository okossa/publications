import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Portfolio, ConcretePortfolio } from "app/models/portfolio";
import { PortfolioService } from "app/services/portfolio.service";
import { CounterParty, ConcreteCounterParty } from "app/models/counterparty";


@Component({
    selector: 'PortfolioEditorComponent',
    templateUrl: './component.html',
    styleUrls: ['./styles.css']
})

export class PortfolioEditorComponent implements OnInit {
    constructor(public portfolioService: PortfolioService) {
    }

    ngOnInit(): void {
        console.log('PortfolioEditorComponent: portfolio editor initialisation...');
        this.portfolio = new ConcretePortfolio([]);
        this.portfolioService.getPorfolioStream()
            .subscribe(fetchedPortfolio => {
                if (fetchedPortfolio != null) {
                    console.log('PortfolioEditorComponent: fetching new portfolio ...', this.portfolio);
                    this.portfolio = fetchedPortfolio;
                }
            });
    }

    public savePortfolio() {
        console.log('PortfolioEditorComponent: saving portfolio ...');
        this.portfolioService.updatePortfolio(this.portfolio);
    }

    public addCounterParty(newCounterPartyId: number, newCounterPartyName: string, newCounterPartyDescription: string) {
        if (newCounterPartyId != null && newCounterPartyName != null && newCounterPartyDescription != null) {
            console.log('PortfolioEditorComponent: adding counterparty ', this);
            this.portfolio.counterPartyList.push(
                new ConcreteCounterParty(
                    newCounterPartyName,
                    newCounterPartyId,
                    newCounterPartyDescription));
        }
    }

    public deleteCounterParty(counterParty: CounterParty) {
        console.log('PortfolioEditorComponent: deleting counterparty ', counterParty);
        this.portfolio.counterPartyList = this.portfolio.counterPartyList
            .filter(countPart => countPart.counterPartyId != counterParty.counterPartyId);
    }

    public selectCounterparty(_selectedCounterParty: CounterParty) {
        console.log('PortfolioEditorComponent: select counter party ', _selectedCounterParty);
        this.selectedCounterParty = _selectedCounterParty;
    }

    private selectedCounterParty: CounterParty;
    private newCounterPartyId;
    private newCounterPartyName;
    private newCounterPartyDescription;
    private portfolio: Portfolio ;

    getPortfolio(): Portfolio {
        return this.portfolio;
    }
}
