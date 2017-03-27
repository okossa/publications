import { TestBed, async } from '@angular/core/testing';
import { PortfolioEditorComponent } from "app/components/portfolio.editor/component";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { PortfolioService } from "app/services/portfolio.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Portfolio } from "app/models/portfolio";

class MockPortfolioService {

    getPorfolioStream(): BehaviorSubject<Portfolio> {
        console.log('getting portfolio stream');
        return new BehaviorSubject<Portfolio>(null);
    }

    updatePortfolio(portfolio: Portfolio) {
        console.log('updating portfolio stream');
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
                { provide: PortfolioService, useClass: MockPortfolioService },
            ],
        });
        TestBed.compileComponents();
    });

    // it('should create the portfolio.editor component', async(() => {
    //     let fixture = TestBed.createComponent(PortfolioEditorComponent);
    //     let app = fixture.debugElement.componentInstance;
    //     expect(app).toBeTruthy();
    // }));

    // it(`should add an item to the counterparty list`, async(() => {
    //     let fixture = TestBed.createComponent(PortfolioEditorComponent);
    //     let app = fixture.debugElement.componentInstance;
    //     expect(app.title).toEqual('app works!');
    // }));

    // it(`should remove an item from the counterparty list`, async(() => {
    //     let fixture = TestBed.createComponent(PortfolioEditorComponent);
    //     let app = fixture.debugElement.componentInstance;
    //     expect(app.title).toEqual('app works!');
    // }));

    // it('should render 6 items', async(() => {
    //     let fixture = TestBed.createComponent(PortfolioEditorComponent);
    //     fixture.detectChanges();
    //     let compiled = fixture.debugElement.nativeElement;
    //     let numberOfLi = compiled.querySelector('li').length;
    //     expect(numberOfLi).toEqual(6);
    // }));


});