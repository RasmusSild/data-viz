import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomepageComponent } from './homepage/homepage.component';
import { EditorComponent } from './editor/editor.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { GraphComponent } from './graph/graph.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    EditorComponent,
    LineChartComponent,
    GraphComponent
  ],
  imports: [
    BrowserModule,
    ClarityModule,
    AppRoutingModule,
    FormsModule,
    NoopAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
