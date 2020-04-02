import { Component, OnInit, Input } from '@angular/core';
import { Space } from '../../space.model';

@Component({
	selector: 'app-space',
	templateUrl: './space.component.html',
	styleUrls: ['./space.component.css']
})

export class SpaceComponent implements OnInit {
	@Input() space: Space;

	constructor() { }

	ngOnInit(): void {
	}

}
