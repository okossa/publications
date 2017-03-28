export abstract class CounterParty {
    constructor(public counterPartyName: string,
        public counterPartyId: number,
        public counterPartyDescription: string) {
    }
}


export class ConcreteCounterParty extends CounterParty{

}
