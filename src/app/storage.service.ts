import { Card } from './game/card.model';
import { Injectable } from '@angular/core';
import { Player } from './game/player.model';
import { Piece } from './game/piece.model';
import { Space } from './game/space.model';
import { GameService } from './game/game.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

const firebaseUrl = 'https://dog-card-game.firebaseio.com/';

export interface GameInfo {
	id: number;
	name: string;
	turn: number;
	round: number;
	lastUpdate: number;
}

// TODO:
// interface FlatGame {

// }

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
		let loadedGame: boolean | any;

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

		return loadedGame.pipe(map(game => {
			if (game !== null) {
				return this.hydrateGame(game);
			} else {
				return false;
			}
		}));
	}

	loadLocalGame(gameId: number) {
		const key = this.getKey(gameId);
		return JSON.parse(window.localStorage.getItem(key));
	}

	getRemoteGameInfos(): Observable<GameInfo[]> {
		return this.http.get<{[key: string]: GameInfo}>(`${firebaseUrl}gameInfos.json`)
			.pipe(map((gameInfoObjects) => {
				return Object.values(gameInfoObjects);
			}));
	}

	saveRemoteGame(flatGame: any, gameId: number) {
		this.http.put(`${firebaseUrl}games/${gameId}.json`, flatGame).subscribe();
		this.http.put(`${firebaseUrl}gameInfos/${gameId}.json`, {
			id: gameId,
			name: `Game ${gameId}`,
			turn: flatGame.turn,
			round: flatGame.round,
			lastUpdate: Date.now()
		}).subscribe();
	}

	loadRemoteGame(gameId: number) {
		return this.http.get(`${firebaseUrl}/games/${gameId}.json`);
	}

	makeFirebaseRequest(path: string = ''): Observable<any> {
		return this.http.get(`${firebaseUrl}${path}`);
	}

	saveLocalGame(flatGame: any, gameId: number) {
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

	flattenGame(game: GameService) {
		const { players } = game;

		const propertiesToSaveDirectly = [
			'deck',
			'discard',
			'hasDiscarded',
			'round',
			'turn'
		];

		const flatGame: any = {}; // create a FlatGame
		propertiesToSaveDirectly.forEach((prop: string) => {
			flatGame[prop] = game[prop];
		});

		// build pieces

		const pieceList = players.reduce((pieces, player: Player) => {
			pieces = [...pieces, ...player.pieces];
			return pieces;
		}, []);

		const flatPieces = pieceList.map((piece: Piece) => {
			const flatPiece: any = Object.assign({}, piece);
			flatPiece.playerId = players.findIndex(thisPlayer => piece.player === thisPlayer);
			const spaceId = game.boardSpaces.findIndex(thisSpace => piece.space === thisSpace);
			if (spaceId !== -1) {
				flatPiece.spaceId = spaceId;
			} else {
				const goalSpaceId = piece.player.goal.findIndex(thisGoalSpace => thisGoalSpace === piece.space);
				if (goalSpaceId !== -1) {
					flatPiece.goalId = goalSpaceId;
				} else {
					flatPiece.spaceId = -1;
				}
			}
			delete flatPiece.player;
			delete flatPiece.space;

			return flatPiece;
		});

		const convertToIds = (source: any[], search: any[]) => {
			return source.map((item: any) => {
				return search.findIndex(thisItem => item === thisItem);
			});
		};

		const staticSpaces = (spaces: Space[]) => {
			return spaces.map((space: Space) => {
				const flatSpace: any = Object.assign({}, space);
				flatSpace.playerId = players.findIndex(thisPlayer => thisPlayer === space.player);
				flatSpace.pieceId = pieceList.findIndex(thisPiece => thisPiece === space.piece);

				delete flatSpace.player;
				delete flatSpace.piece;

				return flatSpace;
			});
		};

		const flattenedPlayers = players.map((player: Player) => {
			const flatPlayer: any = Object.assign({}, player);
			flatPlayer.pieceIds = convertToIds(player.pieces, pieceList);
			flatPlayer.homePieceIds = convertToIds(player.home, pieceList);
			flatPlayer.flatGoal = staticSpaces(player.goal);
			flatPlayer.flatSpaces = staticSpaces(player.spaces);
			flatPlayer.flatHand = player.hand; // auto-flattens

			delete flatPlayer.spaces;
			delete flatPlayer.goal;
			delete flatPlayer.home;
			delete flatPlayer.pieces;
			delete flatPlayer.hand;

			return flatPlayer;
		});

		flatGame.flatPlayers = flattenedPlayers;
		flatGame.flatPieces = flatPieces;

		return flatGame;
	}

	hydrateGame(flatGame: any) {
		const newGame: any = {};

		Object.entries({
			deck: 'Card',
			discard: 'Card',
		}).forEach(([prop, type]) => {
			if (type === 'Card') {
				if (flatGame[prop]) {
					newGame[prop] = flatGame[prop].map((card: any) => {
						return new Card(card);
					});
				} else {
					newGame[prop] = [];
				}
			}
		});

		// Direct copy
		['round', 'turn', 'hasDiscarded'].forEach(prop => {
			newGame[prop] = flatGame[prop];
		});

		// Early return for incomplete saves
		if (!flatGame.flatPlayers) {
			return newGame;
		}

		// Init empty-ish Players
		newGame.players = flatGame.flatPlayers.map(player => new Player(player));

		// Build initial pieces
		const pieceList = flatGame.flatPieces.map((piece: any) => {
			const newPiece = new Piece(piece);
			newPiece.player = newGame.players[piece.playerId];
			return newPiece;
		});

		// helper function
		const hydrateSpaces = (flatSpace: any) => {
			flatSpace.player = newGame.players[flatSpace.playerId];
			flatSpace.piece = pieceList[flatSpace.pieceId];

			return new Space(flatSpace);
		};

		const boardSpaces: Space[] = [];

		// Fully hydrate the player
		newGame.players.forEach((player, index) => {
			const flatPlayer = flatGame.flatPlayers[index];
			player.pieces = flatPlayer.pieceIds.map(pieceId => pieceList[pieceId]);
			player.home = flatPlayer.homePieceIds.map(pieceId => pieceList[pieceId]);
			player.goal = flatPlayer.flatGoal.map(hydrateSpaces);
			player.spaces = flatPlayer.flatSpaces.map(hydrateSpaces);
			player.hand = flatPlayer.flatHand.map((card: any) => {
				return new Card(card);
			});
			boardSpaces.push(...player.spaces);
		});

		// Hydrate piece spaces
		pieceList.forEach((piece) => {
			if (piece.spaceId !== -1) {
				piece.space = boardSpaces[piece.spaceId];
			} else if (piece.goalId !== -1) {
				piece.space = piece.player.goal[piece.goalId];
			}
		});

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

