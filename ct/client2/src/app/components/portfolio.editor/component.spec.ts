import { TestBed, async } from '@angular/core/testing';
import { PortfolioEditorComponent } from "app/components/portfolio.editor/component";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { PortfolioService } from "app/services/portfolio.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Portfolio, ConcretePortfolio } from "app/models/portfolio";
import { ConcreteCounterParty } from "app/models/counterparty";

class MockPortfolioEditorTestPortfolioService {
    public initialise() {
    }

    getPorfolioStream(): BehaviorSubject<Portfolio> {
        console.log('MockPortfolioEditorTestPortfolioService: getting portfolio stream');
        return new BehaviorSubject<Portfolio>(new ConcretePortfolio([]));
    }

    updatePortfolio(portfolio: Portfolio) {
        console.log('MockPortfolioEditorTestPortfolioService: updating portfolio stream');
    }
}

describe('PortfolioEditorComponent tests', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                PortfolioEditorComponent
            ],
            imports: [
                BrowserModule,
                FormsModule,
                HttpModule
            ],
            providers: [
                PortfolioService,
                { provide: PortfolioService, useClass: MockPortfolioEditorTestPortfolioService },
            ],
        });
        TestBed.compileComponents();
    });

    it('Should create the portfolio.editor component', async(() => {
        let fixture = TestBed.createComponent(PortfolioEditorComponent);
        let app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));

    it(`should add an item to the portfolio`, async(() => {
        let fixture = TestBed.createComponent(PortfolioEditorComponent);
        let app = fixture.debugElement.componentInstance;
        fixture.detectChanges();

        let testLegalID = 9090;
        let testCounterPartyName = 'fakeCounterParty';
        let testCounterPartyDescription = 'fakeCounterParty description';
        app.addCounterParty(testLegalID, testCounterPartyName, testCounterPartyDescription);
        let appPortfolio = app.getPortfolio();
        expect(appPortfolio.counterPartyList.length).toEqual(1);
        expect(appPortfolio.counterPartyList[0].counterPartyId).toEqual(testLegalID);
        expect(appPortfolio.counterPartyList[0].counterPartyName).toEqual(testCounterPartyName);
        expect(appPortfolio.counterPartyList[0].counterPartyDescription).toEqual(testCounterPartyDescription);
    }));

    it(`should remove an item from the counterparty list`, async(() => {
        let fixture = TestBed.createComponent(PortfolioEditorComponent);
        let app = fixture.debugElement.componentInstance;
        fixture.detectChanges();

        let testLegalID = 9090;
        let testCounterPartyName = 'fakeCounterParty';
        let testCounterPartyDescription = 'fakeCounterParty description';
        app.addCounterParty(testLegalID, testCounterPartyName, testCounterPartyDescription);
        app.deleteCounterParty(new ConcreteCounterParty(testCounterPartyName, testLegalID, testCounterPartyDescription));
        let appPortfolio = app.getPortfolio();
        expect(appPortfolio.counterPartyList.length).toEqual(0);
    }));

    it('should render 6 items', async(() => {
        let fixture = TestBed.createComponent(PortfolioEditorComponent);
        let app = fixture.debugElement.componentInstance;
        fixture.detectChanges();

        let testLegalID = 9090;
        let testCounterPartyName = 'fakeCounterParty';
        let testCounterPartyDescription = 'fakeCounterParty description';
        let i = 0;
        for (i = 0; i < 6; i++) {
            app.addCounterParty(testLegalID + '' + i, testCounterPartyName + i, testCounterPartyDescription + i);
        }

        fixture.detectChanges();
        let compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        let numberOfLi = compiled.querySelectorAll('.list-group-item').length;
        expect(numberOfLi).toEqual(6);
    }));


});