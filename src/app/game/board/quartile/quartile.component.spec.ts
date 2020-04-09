import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuartileComponent } from './quartile.component';

describe('QuartileComponent', () => {
	let component: QuartileComponent;
	let fixture: ComponentFixture<QuartileComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ QuartileComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(QuartileComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
