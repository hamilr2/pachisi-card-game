import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LiveService } from '../live.service';
import { GameLogItem } from './game-log-item.interface';
import { GameService } from './game.service';
import { InterfaceService } from './interface.service';

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
	userAction: string;

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
			if (!this.game.activePlayer) {
				this.status = 'Swap Round';
			} else if (this.game.activePlayer === this.game.player) {
				this.status = 'It is your turn';
			} else {
				this.status = `${this.game.activePlayer.name} is playing`;
			}
			this.buildLastAction(this.game.log.slice(-1)[0]);
			this.buildUserAction();
		});
		this.interfaceService.update.subscribe(() => {
			this.buildUserAction();
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

	buildUserAction() {
		let action = '';
		if (this.game.turn === 0) {
			if (this.game.player.swapCard) {
				action = 'Waiting for other players to choose their card to swap';
			} else {
				action = `Select a card to swap with ${this.game.player.swapPlayer.name}`;
			}
		} else if (this.game.activePlayer !== this.game.player) {
			action = 'Await your turn';
		} else {
			if (this.interfaceService.selectingPiece === false && this.interfaceService.selectingSpace === false) {
				if (this.interfaceService.isDiscardNecessary()) {
					// todo:  need rule variant for team play and sitting out the round
					action = 'Select a card to discard';
				} else {
					action = 'Select a card to play';
				}
			} else if (this.interfaceService.selectingPiece) {
				action = 'Select a piece to move';
			} else if (this.interfaceService.selectingSpace) {
				action = 'Select a space to move to';
			}
			if (this.interfaceService.burningRemaining) {
				action = `${action} -- ${this.interfaceService.burningRemaining} burning moves remaining`;
			}
		}

		this.userAction = action;
	}

	onClick() {
		this.interfaceService.reset();
	}

	ngOnDestroy() {
		this.live.closeAllConnections();
	}
}
