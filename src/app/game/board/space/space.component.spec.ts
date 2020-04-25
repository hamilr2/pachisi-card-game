import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceComponent } from './space.component';
import { InterfaceService } from '../../interface.service';
import { Space } from '../../space.model';
import { Player } from '../../player.model';

describe('SpaceComponent', () => {
	let component: SpaceComponent;
	let fixture: ComponentFixture<SpaceComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [ InterfaceService ],
			declarations: [ SpaceComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SpaceComponent);
		component = fixture.componentInstance;
		const player = new Player({
			color: 'red',
			id: 0,
			name: 'Red'
		});
		component.space = new Space({
			player
		});
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
