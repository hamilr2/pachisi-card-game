import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PieceComponent } from './piece.component';
import { InterfaceService } from '../../interface.service';
import { Piece } from '../../piece.model';

describe('PieceComponent', () => {
	let component: PieceComponent;
	let fixture: ComponentFixture<PieceComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [ InterfaceService ],
			declarations: [ PieceComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PieceComponent);
		component = fixture.componentInstance;
		component.piece = new Piece({
			id: 0,
			color: 'red'
		});
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
