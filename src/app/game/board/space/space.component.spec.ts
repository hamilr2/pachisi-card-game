import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InterfaceService } from '../../interface.service';
import { Player } from '../../player.model';
import { Space } from '../../space.model';
import { PieceComponent } from '../piece/piece.component';
import { SpaceComponent } from './space.component';


describe('SpaceComponent', () => {
	let component: SpaceComponent;
	let fixture: ComponentFixture<SpaceComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [ InterfaceService ],
			declarations: [ SpaceComponent, PieceComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SpaceComponent);
		component = fixture.componentInstance;
		const player = new Player({
			color: 'red',
			id: 0,
			name: 'Red'
		});
		component.space = new Space({
			player
		});
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
