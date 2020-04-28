import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LobbyComponent } from '../lobby/lobby.component';
import { SplashScreenComponent } from './splash-screen.component';


describe('SplashScreenComponent', () => {
	let component: SplashScreenComponent;
	let fixture: ComponentFixture<SplashScreenComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule, RouterTestingModule ],
			declarations: [ SplashScreenComponent, LobbyComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SplashScreenComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
