import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InterfaceService } from 'src/app/game/interface.service';
import { PieceComponent } from '../../piece/piece.component';
import { SpaceComponent } from '../../space/space.component';
import { SpaceSetComponent } from './space-set.component';

describe('SpaceSetComponent', () => {
	let component: SpaceSetComponent;
	let fixture: ComponentFixture<SpaceSetComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [ InterfaceService ],
			declarations: [ SpaceSetComponent, SpaceComponent, PieceComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SpaceSetComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
