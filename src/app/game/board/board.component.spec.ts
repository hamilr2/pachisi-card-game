import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from '../card/card.component';
import { DeckComponent } from '../deck/deck.component';
import { GameService } from '../game.service';
import { InterfaceService } from '../interface.service';
import { PlayerCornerComponent } from '../player-corner/player-corner.component';
import { AnimationsComponent } from './animations/animations.component';
import { BoardComponent } from './board.component';
import { GoalComponent } from './goal/goal.component';
import { HomeComponent } from './home/home.component';
import { PieceComponent } from './piece/piece.component';
import { QuartileComponent } from './quartile/quartile.component';
import { SpaceSetComponent } from './quartile/space-set/space-set.component';
import { SpaceComponent } from './space/space.component';


describe('BoardComponent', () => {
	let component: BoardComponent;
	let fixture: ComponentFixture<BoardComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule ],
			providers: [ GameService, InterfaceService ],
			declarations: [
				BoardComponent,
				QuartileComponent,
				DeckComponent,
				CardComponent,
				AnimationsComponent,
				PlayerCornerComponent,
				HomeComponent,
				GoalComponent,
				SpaceSetComponent,
				SpaceComponent,
				PieceComponent
			]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(BoardComponent);
		component = fixture.componentInstance;
		component.game.newGame();
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
