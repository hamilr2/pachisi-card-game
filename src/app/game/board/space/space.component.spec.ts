import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '../../game.service';
import { InterfaceService } from '../../interface.service';
import { Player } from '../../player.model';
import { Space } from '../../space.model';
import { PieceComponent } from '../piece/piece.component';
import { SpaceComponent } from './space.component';


describe('SpaceComponent', () => {
	let component: SpaceComponent;
	let fixture: ComponentFixture<SpaceComponent>;
	let game: GameService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [ InterfaceService, GameService ],
			declarations: [ SpaceComponent, PieceComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SpaceComponent);
		component = fixture.componentInstance;
		game = TestBed.inject(GameService);
		game.newGame();

		const player = new Player({
			color: 'red',
			id: 0,
			name: 'Red'
		}, game.rules);

		component.space = new Space({
			player
		});
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
