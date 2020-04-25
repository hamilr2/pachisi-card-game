import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalComponent } from './goal.component';
import { Player } from '../../player.model';

describe('GoalComponent', () => {
	let component: GoalComponent;
	let fixture: ComponentFixture<GoalComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ GoalComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GoalComponent);
		component = fixture.componentInstance;
		component.player = new Player({
			color: 'red',
			id: 0,
			name: 'Red'
		});
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
