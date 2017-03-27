/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { PortfolioEditorComponent } from "app/components/portfolio.editor/component";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { PortfolioService } from "app/services/portfolio.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Portfolio } from "app/models/portfolio";

class MockPortfolioService {
  public initialise() {
    console.log('initialising mock service ...');
  }

  getPorfolioStream(): BehaviorSubject<Portfolio> {
    console.log('getting portfolio stream');
    return new BehaviorSubject<Portfolio>(null);
  }

  updatePortfolio(portfolio: Portfolio) {
    console.log('updating portfolio stream');
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
        { provide: PortfolioService, useClass: MockPortfolioService },
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
