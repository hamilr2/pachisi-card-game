import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { CardComponent } from './game/card/card.component';
import { HandComponent } from './game/hand/hand.component';
import { GameComponent } from './game/game.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { BoardComponent } from './game/board/board.component';
import { SpaceComponent } from './game/board/space/space.component';
import { HomeComponent } from './game/board/home/home.component';
import { GoalComponent } from './game/board/goal/goal.component';
import { DeckComponent } from './game/deck/deck.component';
import { HandCardComponent } from './game/hand/hand-card/hand-card.component';
import { PieceComponent } from './game/board/piece/piece.component';


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
];

@NgModule({
	declarations: [
		AppComponent,
		CardComponent,
		HandComponent,
		GameComponent,
		SplashScreenComponent,
		BoardComponent,
		SpaceComponent,
		HomeComponent,
		GoalComponent,
		DeckComponent,
		HandCardComponent,
		PieceComponent
	],
	imports: [
		BrowserModule,
		RouterModule.forRoot(routes)
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
