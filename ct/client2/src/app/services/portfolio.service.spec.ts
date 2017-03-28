
/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { PortfolioEditorComponent } from "app/components/portfolio.editor/component";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule, Http } from "@angular/http";
import { PortfolioService } from "app/services/portfolio.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Portfolio } from "app/models/portfolio";

class MockHttp {

}

describe('PortfolioService tests', () => {
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
        { provide: Http, useClass: MockHttp },
      ],
    });
    TestBed.compileComponents();
  });

  it('should get the portfolio', async(() => {
    // let fixture = TestBed.createComponent(AppComponent);
    // let app = fixture.debugElement.componentInstance;
    // expect(app).toBeTruthy();
    // fixture.detectChanges();
  }));

  it('should update the portfolio', async(() => { 
    // let fixture = TestBed.createComponent(AppComponent);
    // let app = fixture.debugElement.componentInstance;
    // expect(app).toBeTruthy();
    // fixture.detectChanges();
  }));
});
