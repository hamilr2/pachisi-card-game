import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerCornerComponent } from './player-corner.component';

describe('PlayerCornerComponent', () => {
	let component: PlayerCornerComponent;
	let fixture: ComponentFixture<PlayerCornerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ PlayerCornerComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PlayerCornerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
