import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { PortfolioDisplayerComponent } from "app/components/portfolio.displayer/component";
import { PortfolioEditorComponent } from "app/components/portfolio.editor/component";
import { PortfolioService } from "app/services/portfolio.service";

@NgModule({
  declarations: [
    AppComponent,
    PortfolioEditorComponent,
    PortfolioDisplayerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    PortfolioService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
