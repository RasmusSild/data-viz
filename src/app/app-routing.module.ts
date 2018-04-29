import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { EditorComponent } from './editor/editor.component';
import { DemoComponent } from './demo/demo.component';
import { HelpComponent } from './help/help.component';

const routes: Routes = [
  {
    path: '',
    component: HomepageComponent,
    pathMatch: 'full'
  },
  {
    path: 'new',
    component: EditorComponent,
    pathMatch: 'full'
  },
  {
    path: 'demo',
    component: DemoComponent,
    pathMatch: 'full'
  },
  {
    path: 'help',
    component: HelpComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
