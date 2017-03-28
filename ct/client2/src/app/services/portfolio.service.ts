import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs/Rx";
import { Http, Headers } from "@angular/http";
import { Portfolio, ConcretePortfolio } from "app/models/portfolio";
import { ConcreteCounterParty } from "app/models/counterparty";

const keyPortofolio = 'KEY_PORTFOLIO';

@Injectable()
export class PortfolioService {
    constructor(private http: Http) {
    }

    private portfoliostream: BehaviorSubject<Portfolio> = new BehaviorSubject<Portfolio>(null);

    public initialise() {
        let dataFromStorage = window.localStorage.getItem(keyPortofolio);
        if (dataFromStorage!=null) {
            this.portfoliostream.next(JSON.parse(dataFromStorage));
        }
        else {
            let counterPartyList = [
                new ConcreteCounterParty('bnp', 2212, 'bnp description'),
                new ConcreteCounterParty('axa', 2212, 'axa description'),
                new ConcreteCounterParty('sgib', 2212, 'sgib description'),
                new ConcreteCounterParty('credit agricol', 2212, 'credit agricol description')
            ];
            let initialPortfolio = new ConcretePortfolio(counterPartyList);
            this.portfoliostream.next(initialPortfolio);
        }
    }

    getPorfolioStream(): BehaviorSubject<Portfolio> {
        return this.portfoliostream;
    }

    updatePortfolio(portfolio: Portfolio) {
        window.localStorage.setItem(keyPortofolio, JSON.stringify(portfolio));
        this.portfoliostream.next(portfolio);
    }
}
