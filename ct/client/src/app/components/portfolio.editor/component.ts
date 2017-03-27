import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Portfolio } from "app/models/portfolio";
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
        this.portfolioService.getPorfolioStream()
            .subscribe(portfolio => {
                if (portfolio != null) {
                    console.log('fetching portfolio ...', portfolio);
                    this.portfolio = portfolio;
                }
            });
    }

    savePortfolio() {
        console.log('saving portfolio ...');
        this.portfolioService.updatePortfolio(this.portfolio);
    }

    addCounterParty() {
        if (this.newCounterPartyId != null && this.newCounterPartyName && this.newCounterPartyDescription) {
            console.log('adding counterparty')
            this.portfolio.counterPartyList.push(
                new ConcreteCounterParty(this.newCounterPartyId,
                    this.newCounterPartyName,
                    this.newCounterPartyDescription));
        }
    }

    deleteCounterParty(counterParty: CounterParty) {
        console.log('deleting counterparty ', counterParty);
        this.portfolio.counterPartyList = this.portfolio.counterPartyList
            .filter(countPart => countPart.counterPartyId != counterParty.counterPartyId);
    }

    selectCounterparty(_selectedCounterParty: CounterParty) {
        console.log('select counter party ', _selectedCounterParty);
        this.selectedCounterParty = _selectedCounterParty;
    }
    
    selectedCounterParty: CounterParty;
    newCounterPartyId;
    newCounterPartyName;
    newCounterPartyDescription;
    portfolio: Portfolio;
}
