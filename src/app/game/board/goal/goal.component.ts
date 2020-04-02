import { Component, OnInit, Input } from '@angular/core';
import { Player } from '../../player.model';

@Component({
	selector: 'app-goal',
	templateUrl: './goal.component.html',
	styleUrls: ['./goal.component.css']
})
export class GoalComponent implements OnInit {

	@Input() player: Player;

	constructor() { }

	ngOnInit(): void {
	}

}
