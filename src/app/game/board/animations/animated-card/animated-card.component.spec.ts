import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedCardComponent } from './animated-card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Card } from 'src/app/game/card.model';

describe('AnimatedCardComponent', () => {
	let component: AnimatedCardComponent;
	let fixture: ComponentFixture<AnimatedCardComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [ BrowserAnimationsModule ],
			declarations: [ AnimatedCardComponent ]
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
