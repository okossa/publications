/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { PortfolioEditorComponent } from "app/components/portfolio.editor/component";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { PortfolioService } from "app/services/portfolio.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Portfolio, ConcretePortfolio } from "app/models/portfolio";

class MockAppTestPortfolioService {
  public initialise() {
    console.log('MockAppTestPortfolioService: initialising ...');
    this.portfolioStream.next(new ConcretePortfolio([]));
  }

  portfolioStream: BehaviorSubject<Portfolio> = new BehaviorSubject<Portfolio>(null);
  getPorfolioStream(): BehaviorSubject<Portfolio> {
    return this.portfolioStream;
  }

  updatePortfolio(portfolio: Portfolio) {
    console.log('MockAppTestPortfolioService: saving portfolio', portfolio);
  }
}

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        PortfolioEditorComponent
      ],
      imports: [
        BrowserModule,
        FormsModule,
        HttpModule
      ],
      providers: [
        PortfolioService,
        { provide: PortfolioService, useClass: MockAppTestPortfolioService },
      ],
    });
    TestBed.compileComponents();
  });

  it('should create the app', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
    fixture.detectChanges();
  }));
});
