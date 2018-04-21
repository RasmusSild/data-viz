import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { ColorPickerModule } from 'ngx-color-picker';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomepageComponent } from './homepage/homepage.component';
import { EditorComponent } from './editor/editor.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { GraphComponent } from './graph/graph.component';
import { CustomiserComponent } from './customiser/customiser.component';
import { HeaderComponent } from './header/header.component';
import { ResizeService } from './resize.service';
import { CentralityTableComponent } from './centrality-table/centrality-table.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    EditorComponent,
    LineChartComponent,
    GraphComponent,
    CustomiserComponent,
    HeaderComponent,
    CentralityTableComponent
  ],
  imports: [
    BrowserModule,
    ClarityModule,
    AppRoutingModule,
    FormsModule,
    NoopAnimationsModule,
    ColorPickerModule
  ],
  providers: [ResizeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
