import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceSetComponent } from './space-set.component';

describe('SpaceSetComponent', () => {
	let component: SpaceSetComponent;
	let fixture: ComponentFixture<SpaceSetComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ SpaceSetComponent ]
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
