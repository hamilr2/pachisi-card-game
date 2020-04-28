import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Card } from 'src/app/game/card.model';
import { CardComponent } from 'src/app/game/card/card.component';
import { AnimatedCardComponent } from './animated-card.component';


describe('AnimatedCardComponent', () => {
	let component: AnimatedCardComponent;
	let fixture: ComponentFixture<AnimatedCardComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [ BrowserAnimationsModule ],
			declarations: [ AnimatedCardComponent, CardComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnimatedCardComponent);
		component = fixture.componentInstance;
		component.animatedCard = {
			card: new Card({
				symbol: 'T'
			}),
			startPosition: 'topLeft',
			endPosition: 'discard'
		};
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
