import { CounterParty } from "app/models/counterparty";

export abstract class Portfolio {
    constructor(public counterPartyList: CounterParty[]) {
    }
}

export class ConcretePortfolio extends Portfolio{

}