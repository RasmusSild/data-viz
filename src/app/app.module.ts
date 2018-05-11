import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { ColorPickerModule } from 'ngx-color-picker';

import { AppComponent } from './app.component';
import { AppRoutingModule, CustomReuseStrategy } from './app-routing.module';
import { HomepageComponent } from './homepage/homepage.component';
import { EditorComponent } from './editor/editor.component';
import { GraphComponent } from './graph/graph.component';
import { CustomiserComponent } from './customiser/customiser.component';
import { HeaderComponent } from './header/header.component';
import { ResizeService } from './resize.service';
import { CentralityTableComponent } from './centrality-table/centrality-table.component';
import { DemoComponent } from './demo/demo.component';
import { HelpComponent } from './help/help.component';
import { RouteReuseStrategy } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    EditorComponent,
    GraphComponent,
    CustomiserComponent,
    HeaderComponent,
    CentralityTableComponent,
    DemoComponent,
    HelpComponent
  ],
  imports: [
    BrowserModule,
    ClarityModule,
    AppRoutingModule,
    FormsModule,
    NoopAnimationsModule,
    ColorPickerModule
  ],
  providers: [ResizeService, { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
