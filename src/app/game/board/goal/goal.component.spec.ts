import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InterfaceService } from '../../interface.service';
import { Player } from '../../player.model';
import { PieceComponent } from '../piece/piece.component';
import { SpaceSetComponent } from '../quartile/space-set/space-set.component';
import { SpaceComponent } from '../space/space.component';
import { GoalComponent } from './goal.component';


describe('GoalComponent', () => {
	let component: GoalComponent;
	let fixture: ComponentFixture<GoalComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [ InterfaceService ],
			declarations: [ GoalComponent, SpaceSetComponent, SpaceComponent, PieceComponent ]
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
