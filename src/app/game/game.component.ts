import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';
import { InterfaceService } from './interface.service';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css'],
	providers: [GameService, InterfaceService]
})
export class GameComponent implements OnInit {

	constructor(public game: GameService, public interfaceService: InterfaceService) { }

	ngOnInit(): void {
	}

}
