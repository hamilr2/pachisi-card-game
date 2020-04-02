import { Card } from './game/card.model';
import { Injectable } from '@angular/core';
import { Player } from './game/player.model';
import { Piece } from './game/piece.model';
import { Space } from './game/space.model';

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

		const newGame: any = {};

		Object.entries({
			deck: 'Card',
			hand: 'Card',
			discard: 'Card',
		}).forEach(([prop, type]) => {
			if (type === 'Card') {
				newGame[prop] = loadedGame[prop].map((card: any) => {
					return new Card(card);
				});
			}
		});

		// Direct copy
		['round', 'turn', 'hasDiscarded'].forEach(prop => {
			newGame[prop] = loadedGame[prop];
		});

		// Early return for incomplete saves
		if (!loadedGame.flatPlayers) {
			return newGame;
		}

		// Init empty-ish Players
		newGame.players = loadedGame.flatPlayers.map(player => new Player(player));

		// Build pieces
		const pieceList = loadedGame.flatPieces.map((piece: any) => {
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

		// Fully hydrate the player
		newGame.players.forEach((player, index) => {
			const flatPlayer = loadedGame.flatPlayers[index];
			player.pieces = flatPlayer.pieceIds.map(pieceId => pieceList[pieceId]);
			player.home = flatPlayer.homePieceIds.map(pieceId => pieceList[pieceId]);
			player.goal = flatPlayer.flatGoal.map(hydrateSpaces);
			player.spaces = flatPlayer.flatSpaces.map(hydrateSpaces);
		});



		return newGame;
	}

	saveGame(game: any, key: string = 'defaultGame'): any {
		const { players } = game;

		const propertiesToSaveDirectly = [
			'deck',
			'discard',
			'hand',
			'hasDiscarded',
			'round',
			'turn'
		];

		const gameToSave: any = {};
		propertiesToSaveDirectly.forEach((prop: string) => {
			gameToSave[prop] = game[prop];
		});

		// build pieces

		const pieceList = players.reduce((pieces, player: Player) => {
			pieces = [...pieces, ...player.pieces];
			return pieces;
		}, []);

		const flatPieces = pieceList.map((piece: Piece) => {
			const flatPiece: any = Object.assign({}, piece);
			flatPiece.playerId = players.findIndex(thisPlayer => piece.player === thisPlayer);

			delete flatPiece.player;

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

			delete flatPlayer.spaces;
			delete flatPlayer.goal;
			delete flatPlayer.home;
			delete flatPlayer.pieces;

			return flatPlayer;
		});

		gameToSave.flatPlayers = flattenedPlayers;
		gameToSave.flatPieces = flatPieces;

		window.localStorage.setItem(key, JSON.stringify(gameToSave));
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

