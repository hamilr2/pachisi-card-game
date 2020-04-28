import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '../../game.service';
import { InterfaceService } from '../../interface.service';
import { Player } from '../../player.model';
import { GoalComponent } from '../goal/goal.component';
import { HomeComponent } from '../home/home.component';
import { PieceComponent } from '../piece/piece.component';
import { SpaceComponent } from '../space/space.component';
import { QuartileComponent } from './quartile.component';
import { SpaceSetComponent } from './space-set/space-set.component';


describe('QuartileComponent', () => {
	let component: QuartileComponent;
	let fixture: ComponentFixture<QuartileComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule ],
			providers: [ GameService, InterfaceService ],
			declarations: [
				QuartileComponent,
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
		fixture = TestBed.createComponent(QuartileComponent);
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
