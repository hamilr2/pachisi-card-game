import { Component, OnInit, Input } from '@angular/core';
import { GameService } from '../game.service';

@Component({
	selector: 'app-board',
	templateUrl: './board.component.html',
	styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
	@Input() game: GameService;

	constructor() { }

	ngOnInit(): void {
	}

}
