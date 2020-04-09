import { Component, OnInit, Input } from '@angular/core';
import { Space } from 'src/app/game/space.model';

@Component({
	selector: 'app-space-set',
	templateUrl: './space-set.component.html',
	styleUrls: ['./space-set.component.css']
})
export class SpaceSetComponent implements OnInit {
	@Input() spaces: Space[];
	@Input() rotation: number;
	@Input() parentRotation: number;
	@Input() isGoal: boolean;

	constructor() { }

	ngOnInit(): void {
	}

}
