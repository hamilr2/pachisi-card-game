import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '../game.service';
import { Player } from '../player.model';
import { PlayerCornerComponent } from './player-corner.component';


describe('PlayerCornerComponent', () => {
	let component: PlayerCornerComponent;
	let fixture: ComponentFixture<PlayerCornerComponent>;
	let game: GameService;

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

		game = TestBed.inject(GameService);
		game.newGame();

		component.player = new Player({
			color: 'red',
			id: 0,
			name: 'Red'
		}, game);

		component.corner = 'topLeft';
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
