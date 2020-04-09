import { Component, OnInit, Input } from '@angular/core';
import { Player } from '../../player.model';
import { GameService } from '../../game.service';
import { Space } from '../../space.model';

const SPACE_SET_SIZE = 4;
const NUM_SPACE_SETS = 4;

@Component({
	selector: 'app-quartile',
	templateUrl: './quartile.component.html',
	styleUrls: ['./quartile.component.css']
})

export class QuartileComponent implements OnInit {

	@Input() player: Player;
	@Input() rotation: number;
	spaceSets: Space[][];
	setRotation: number[] = [-90, 0, -45, -90];

	constructor(public game: GameService) { }

	ngOnInit(): void {
		this.buildSpaceSets();
		this.game.majorUpdate.subscribe(() => {
			this.buildSpaceSets();
		});
	}

	buildSpaceSets(): Space[][] {
		this.spaceSets = [];
		for (let set = 0; set < NUM_SPACE_SETS; set++) {
			this.spaceSets.push(this.player.spaces.slice(set * SPACE_SET_SIZE, (set * SPACE_SET_SIZE) + SPACE_SET_SIZE));
		}
		return this.spaceSets;
	}

	getSetRotation(index: number) {
		return this.setRotation[index];
	}

}
