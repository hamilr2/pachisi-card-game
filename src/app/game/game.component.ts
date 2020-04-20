import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService, GameLogItem } from './game.service';
import { InterfaceService } from './interface.service';
import { ActivatedRoute } from '@angular/router';
import { LiveService } from '../live.service';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css'],
	providers: [GameService, InterfaceService]
})
export class GameComponent implements OnInit, OnDestroy {

	gameId: number;
	playerId: number;
	location: string;
	initialized = false;
	status: string;
	lastAction: string;

	constructor(
		public game: GameService,
		public interfaceService: InterfaceService,
		private route: ActivatedRoute,
		private live: LiveService
	) { }

	ngOnInit(): void {
		this.gameId = Number(this.route.snapshot.params.gameId);
		this.location = this.route.snapshot.params.location;
		this.playerId = Number(this.route.snapshot.params.playerId) - 1; // actual id is array indexed
		this.game.majorUpdate.subscribe(() => {
			this.initialized = true;
			this.interfaceService.setGame(this.game, this.playerId);
		});
		this.game.update.subscribe(() => {
			if (this.game.activePlayer === this.game.player) {
				this.status = 'It is your turn';
			} else {
				this.status = `${this.game.activePlayer.name} is playing`;
			}
			this.buildLastAction(this.game.log.slice(-1)[0]);
		});
		this.game.loadGame(this.gameId, this.location, this.playerId);
	}

	buildLastAction(item: GameLogItem) {
		if (!item) {
			return;
		}
		const { player, card, action } = item;
		if (item.action === 'play') {
			this.lastAction = `${player.name} played a ${card.symbol}`;
		} else if (action.includes('discard')) {
			this.lastAction = `${player.name} discarded a ${card.symbol}`;
			if (action === 'discardAndDraw') {
				this.lastAction = `${this.lastAction} and drew a new card`;
			}
		}
	}

	onClick() {
		this.interfaceService.reset();
	}

	ngOnDestroy() {
		this.live.closeAllConnections();
	}
}
