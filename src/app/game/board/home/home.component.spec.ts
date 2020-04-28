import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '../../game.service';
import { InterfaceService } from '../../interface.service';
import { Player } from '../../player.model';
import { PieceComponent } from '../piece/piece.component';
import { SpaceSetComponent } from '../quartile/space-set/space-set.component';
import { SpaceComponent } from '../space/space.component';
import { HomeComponent } from './home.component';


describe('HomeComponent', () => {
	let component: HomeComponent;
	let fixture: ComponentFixture<HomeComponent>;
	let game: GameService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule, ],
			providers: [ GameService, InterfaceService ],
			declarations: [ HomeComponent, SpaceSetComponent, SpaceComponent, PieceComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(HomeComponent);
		component = fixture.componentInstance;
		game = TestBed.inject(GameService);
		game.newGame();


		component.player = new Player({
			color: 'red',
			id: 0,
			name: 'Red'
		}, game.rules);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
