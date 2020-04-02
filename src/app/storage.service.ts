import { Card } from './game/card.model';
import { Injectable } from '@angular/core';

const mappableProps = {
	deck: 'Card',
	hand: 'Card',
	discard: 'Card',
};

@Injectable({
	providedIn: 'root'
})

export class StorageService {
	loadGame(key: string = 'defaultGame'): any | boolean {

		let loadedGame: any;

		try {
			loadedGame = JSON.parse(window.localStorage.getItem(key));
		} catch (e) {
			return false;
		}

		if (!loadedGame) {
			return false;
		}

		Object.entries(mappableProps).forEach(([prop, type]) => {
			if (type === 'Card') {
				loadedGame[prop] = loadedGame[prop].map((card: any) => {
					return new Card(card);
				});
			}
		});

		return loadedGame;
	}

	saveGame(game: any, key: string = 'defaultGame'): any {
		const propertiesToSave = [
			'deck',
			'discard',
			'hand',
			'hasDiscarded',
			'round',
			'turn'
		];

		const gameToSave = {};
		propertiesToSave.forEach((prop: string) => {
			gameToSave[prop] = game[prop];
		});

		window.localStorage.setItem(key, JSON.stringify(gameToSave));
	}
}
