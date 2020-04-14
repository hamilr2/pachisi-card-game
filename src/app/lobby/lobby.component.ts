import { Component, OnInit, Input } from '@angular/core';
import { StorageService } from '../storage.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-lobby',
	templateUrl: './lobby.component.html',
	styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {
	@Input() type: string;
	games: any[] = [];

	constructor(
		private storage: StorageService,
		private router: Router
	) { }

	onCreateClick() {
		const maxId = this.games.reduce((max, game) => {
			if (game.id > max) {
				max = game.id;
			}
			return max;
		}, 0);
		this.router.navigate([`/games/${this.type}/${maxId + 1}/player/1`]);
	}

	ngOnInit(): void {
		if (this.type === 'local') {
			this.games = this.storage.getGameInfos();
		} else {
			this.storage.getRemoteGameInfos().subscribe((gameInfos) => {
				this.games = gameInfos;
			});
		}
	}

}
