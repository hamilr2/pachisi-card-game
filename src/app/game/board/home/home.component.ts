import { Component, OnInit, Input } from '@angular/core';
import { Player } from '../../player.model';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	@Input() player: Player;

	constructor() { }

	ngOnInit(): void {
	}

}
