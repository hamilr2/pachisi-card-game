import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from '../card/card.component';
import { GameService } from '../game.service';
import { InterfaceService } from '../interface.service';
import { HandCardComponent } from './hand-card/hand-card.component';
import { HandComponent } from './hand.component';


describe('HandComponent', () => {
	let component: HandComponent;
	let fixture: ComponentFixture<HandComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule ],
			providers: [ GameService, InterfaceService ],
			declarations: [ HandComponent, HandCardComponent, CardComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(HandComponent);
		component = fixture.componentInstance;
		const game = TestBed.inject(GameService);
		game.newGame();

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
