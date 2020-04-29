import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameComponent } from './game.component';
import { GameService } from './game.service';


describe('GameComponent', () => {
	let component: GameComponent;
	let fixture: ComponentFixture<GameComponent>;

	let game: GameService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule, RouterTestingModule ],
			providers: [ GameService ],
			declarations: [ GameComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GameComponent);
		component = fixture.componentInstance;

		game = TestBed.inject(GameService);
		game.newGame();
		game.executeAdvanceRound();
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	// Need to set up the testing router for further tests here probably

	// fit('should show swap message in user-actions', () => {
	// 	const element = fixture.nativeElement;
	// 	console.log(element.innerHTML);
	// 	const span: Element = element.querySelector('.user-action span');

	// 	expect(span.innerHTML).toContain('Select a card to swap with');

	// });

});
