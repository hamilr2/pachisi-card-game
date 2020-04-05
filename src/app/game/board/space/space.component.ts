import { Component, OnInit, Input } from '@angular/core';
import { Space } from '../../space.model';
import { InterfaceService } from '../../interface.service';

@Component({
	selector: 'app-space',
	templateUrl: './space.component.html',
	styleUrls: ['./space.component.css']
})

export class SpaceComponent implements OnInit {
	@Input() space: Space;

	constructor(private interfaceService: InterfaceService) { }

	isSpaceSelectable() {
		if (this.space && this.interfaceService.selectingSpace) {
			if (this.interfaceService.selectableSpaces.length) {
				return !!this.interfaceService.selectableSpaces.find(space => this.space === space);
			}
		}
	}

	onClick() {
		if (this.isSpaceSelectable()) {
			this.interfaceService.selectSpace(this.space);
		}
	}

	ngOnInit(): void {
	}

}
