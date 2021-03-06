import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Card } from './game/card.model';
import { FlatGameLogItem, GameLogItem } from './game/game-log-item.interface';
import { GameInterface, GameRules, GameService } from './game/game.service';
import { FlatPiece, Piece } from './game/piece.model';
import { FlatPlayer, Player } from './game/player.model';
import { FlatSpace, Space, SpaceOptions } from './game/space.model';

const firebaseUrl = environment.firebaseUrl;

export interface GameInfo {
	id: number;
	name: string;
	turn: number;
	round: number;
	lastUpdate: number;
}

interface FlatGame {
	gameId: number;
	// name: string; // not implemented
	rules: GameRules;

	turn: number;
	round: number;
	hasDiscarded: boolean;
	winnerId: number;
	continuePlaying: boolean;
	turnOrderIds: number[];

	cards: Card[]; // Card is already a 'flat' type

	flatPlayers: FlatPlayer[];
	flatSpaces: FlatSpace[];
	flatPieces: FlatPiece[];

	deckCardIds: number[];
	discardCardIds: number[];
}

@Injectable({
	providedIn: 'root'
})

export class StorageService {

	constructor(
		private http: HttpClient
	) {}

	getKey(gameId: number) {
		return `game-${gameId}`;
	}

	loadGame(gameId: number, location: string): Observable<any> {
		let loadedGame: boolean | Observable<FlatGame> | FlatGame;

		if (location === 'local') {
			loadedGame = this.loadLocalGame(gameId);
			if (!loadedGame) {
				return of(false);
			} else {
				loadedGame = of(loadedGame);
			}
		} else {
			loadedGame = this.loadRemoteGame(gameId);
		}

		return loadedGame.pipe(map((game: FlatGame) => {
			if (game !== null) {
				return this.hydrateGame(game);
			} else {
				return false;
			}
		}));
	}

	loadLocalGame(gameId: number): FlatGame {
		const key = this.getKey(gameId);
		return JSON.parse(window.localStorage.getItem(key)) as FlatGame;
	}

	getRemoteGameInfos(): Observable<GameInfo[]> {
		return this.http.get<Record<string, GameInfo>>(`${firebaseUrl}gameInfos.json`)
			.pipe(map((gameInfoObjects) => {
				return Object.values(gameInfoObjects).filter(gameInfo => !!gameInfo);
			}));
	}

	saveRemoteGame(flatGame: FlatGame, gameId: number) {
		this.http.patch(`${firebaseUrl}games/${gameId}.json`, flatGame).subscribe();
		this.http.patch(`${firebaseUrl}gameInfos/${gameId}.json`, {
			id: gameId,
			name: `Game ${gameId}`,
			turn: flatGame.turn,
			round: flatGame.round,
			lastUpdate: Date.now()
		}).subscribe();
	}

	loadRemoteGame(gameId: number): Observable<FlatGame> {
		return this.http.get<FlatGame>(`${firebaseUrl}/games/${gameId}.json`);
	}

	makeFirebaseRequest(path: string = ''): Observable<any> {
		return this.http.get(`${firebaseUrl}${path}`);
	}

	saveLocalGame(flatGame: FlatGame, gameId: number) {
		const gameKey = this.getKey(gameId);
		window.localStorage.setItem(gameKey, JSON.stringify(flatGame));

		const gameInfos = this.getGameInfos();
		const gameIndex = gameInfos.findIndex(({ id }) => id === gameId);

		if (gameIndex === -1) {
			gameInfos.push({
				id: gameId,
				name: `Game ${gameId}`,
				turn: flatGame.turn,
				round: flatGame.round,
				lastUpdate: Date.now()
			});
		} else {
			Object.assign(gameInfos[gameIndex], {
				turn: flatGame.turn,
				round: flatGame.round,
				lastUpdate: Date.now()
			});
		}

		this.setGameInfos(gameInfos);
	}

	saveGame(game: GameService, gameId: number): any {
		const flatGame = this.flattenGame(game);

		if (game.location === 'local') {
			this.saveLocalGame(flatGame, gameId);
		} else {
			this.saveRemoteGame(flatGame, gameId);
		}
	}

	sendLogItem(item: GameLogItem, gameId: number) {
		const flatItem = this.flattenGameLogItem(item);
		this.http.post(`${firebaseUrl}games/${gameId}/gameLog.json`, flatItem).subscribe();
	}

	flattenGameLogItem(item: GameLogItem): FlatGameLogItem {
		const newItem: FlatGameLogItem = {
			action: item.action
		};

		Object.entries(item).forEach(([key, value]) => {
			if (!!value) {
				if (key === 'cards') {
					newItem.cardIds = value.map((card: Card) => card.id);
				} else if (key !== 'action') {
					newItem[key + 'Id'] = value.id;
				}
			}
		});

		return newItem;
	}

	flattenGame(game: GameService): FlatGame {
		const { deck, discard, pieces, players, spaces, turnOrder, winner } = game;

		const propertiesToSaveDirectly = [
			'gameId',
			'rules',
			'turn',
			'round',
			'hasDiscarded',
			'cards',
			'rules',
			'continuePlaying'
		];

		const flatGame: Partial<FlatGame> = {};

		propertiesToSaveDirectly.forEach((prop: string) => {
			flatGame[prop] = game[prop];
		});

		// build pieces
		flatGame.flatPieces = pieces.map(piece => {
			const { player, space, ...flatPiece }: Piece & FlatPiece = piece;

			flatPiece.playerId = player ? player.id : undefined;
			flatPiece.spaceId = space ? space.id : undefined;
			return flatPiece;
		});

		flatGame.flatSpaces = spaces.map(space => {
			const { player, piece, ...flatSpace }: Space & FlatSpace = space;
			flatSpace.pieceId = piece ? piece.id : undefined;
			flatSpace.playerId = player ? player.id : undefined;
			return flatSpace;
		});

		flatGame.flatPlayers = players.map(player => player.flatten());
		flatGame.winnerId = winner ? winner.id : undefined;

		flatGame.deckCardIds = deck.map(card => card.id);
		flatGame.discardCardIds = discard.map(card => card.id);

		flatGame.turnOrderIds = turnOrder.map(player => player.id);

		return flatGame as FlatGame;
	}

	hydrateGame(flatGame: FlatGame): GameInterface {
		const {
			flatPlayers,
			flatSpaces,
			flatPieces,
			deckCardIds = [],
			discardCardIds = [],
			turnOrderIds = [],
			winnerId,
			...newGame
		}: FlatGame & GameInterface = flatGame;

		newGame.cards = newGame.cards.map(card => new Card(card));
		newGame.players = flatPlayers.map(flatPlayer => new Player({ flatPlayer }, newGame));
		newGame.pieces = flatPieces.map(flatPiece => new Piece({ flatPiece }));
		newGame.spaces = flatSpaces.map(flatSpace => {
			const { playerId, pieceId, ...spaceOptions }: FlatSpace & Partial<SpaceOptions> = flatSpace;
			return new Space({
				...spaceOptions,
				player: newGame.players.find(player => player.id === playerId),
				piece: newGame.pieces.find(piece => piece.id === pieceId) || null
			});
		});

		// Re-process pieces, players

		newGame.pieces.forEach((piece, pieceIndex) => {
			piece.hydrate(flatPieces[pieceIndex], newGame);
		});

		newGame.players.forEach((player, playerIndex) => {
			player.hydrate(flatPlayers[playerIndex], newGame);
		});

		newGame.deck = deckCardIds.map(id => {
			return newGame.cards.find(card => card.id === id);
		});
		newGame.discard = discardCardIds.map(id => {
			return newGame.cards.find(card => card.id === id);
		});

		newGame.turnOrder = turnOrderIds.map(playerId => {
			return newGame.players.find(player => player.id === playerId);
		});

		newGame.winner = newGame.players.find(player => player.id === winnerId) || null;

		return newGame;
	}

	setGameInfos(gameInfos: GameInfo[]) {
		localStorage.setItem('games', JSON.stringify(gameInfos));
	}

	getGameInfos(): GameInfo[] {
		return (JSON.parse(localStorage.getItem('games')) || []) as GameInfo[];
	}
}

/*
	Piece
		location: Space
	Player
		goal: Spaces (unique)
		hand: Cards (unique)
		home: Pieces
		pieces: Pieces
		spaces: Spaces (unique)
	Space
		Player
		Piece
*/

