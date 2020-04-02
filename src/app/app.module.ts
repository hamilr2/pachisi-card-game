import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { CardComponent } from './game/card/card.component';
import { HandComponent } from './game/hand/hand.component';
import { GameComponent } from './game/game.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';


const routes: Routes = [
  {
    path: '',
    component: SplashScreenComponent,
    pathMatch: 'full'
  },
  {
    path: 'game',
    component: GameComponent
  },
  {
    path: '**',
    redirectTo: '/'
  }
]

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    HandComponent,
    GameComponent,
    SplashScreenComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
