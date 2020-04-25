import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PlayerCornerComponent } from './player-corner.component';
import { GameService } from '../game.service';
import { Player } from '../player.model';

describe('PlayerCornerComponent', () => {
	let component: PlayerCornerComponent;
	let fixture: ComponentFixture<PlayerCornerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule ], 
			providers: [ GameService ],
			declarations: [ PlayerCornerComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PlayerCornerComponent);
		component = fixture.componentInstance;
		component.player = new Player({
			color: 'red',
			id: 0,
			name: 'Red'
		});
		component.corner = 'topLeft';
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
