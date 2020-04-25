import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { GameService } from './game.service';
import { Piece } from './piece.model';
import { Space } from './space.model';
import { CardSpecials, Card } from './card.model';
import { Player } from './player.model';

describe('Game Service - Basics', () => {
	let game: GameService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [GameService]
		});

		game = TestBed.inject(GameService);
		game.newGame();
	});

	it('should have four players', () => {
		expect(game.players.length).toEqual(4);
	});
});

function assignPieceToSpace(piece: Piece, space: Space) {
	piece.space = space;
	space.piece = piece;
	piece.player.home = piece.player.home.filter(thisPiece => thisPiece !== piece);
}

describe('Game Service - Cards / Movement', () => {

	let game: GameService;

	let boardSpaces: Space[];
	let players: Player[];

	const swapCard = new Card({
		symbol: 'S',
		special: CardSpecials.SWAP
	});

	const startCard = new Card({
		startable: true
	});

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [GameService]
		});

		game = TestBed.inject(GameService);
		game.newGame();

		({ players, boardSpaces } = game);
	});

	//
	// SWAPPING - testing getMovablePiecesForCard
	//

	it('should allow swapping pieces', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[10]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[20]);

		const { movablePieces } = game.getMovablePiecesForCard(players[0], swapCard);

		expect(movablePieces.length).toEqual(1);
		expect(movablePieces[0].spaces.length).toEqual(1);
		expect(movablePieces[0].spaces[0]).toEqual(boardSpaces[20]);
	});

	it ('should not allow swapping own pieces', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[10]);
		assignPieceToSpace(players[0].pieces[1], boardSpaces[20]);

		const { movablePieces } = game.getMovablePiecesForCard(players[0], swapCard);

		expect(movablePieces.length).toEqual(0);
	})

	it('should not allow swapping a piece to the home space', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[61]);

		let cardResult = game.getMovablePiecesForCard(players[1], swapCard);
		expect(cardResult.movablePieces.length).toEqual(0);

		assignPieceToSpace(players[0].pieces[1], boardSpaces[1]);

		cardResult = game.getMovablePiecesForCard(players[1], swapCard);
		expect(cardResult.movablePieces.length).toEqual(1);
	});

	it('should not allow swapping our piece to any space', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[61]);

		let cardResult = game.getMovablePiecesForCard(players[0], swapCard);
		expect(cardResult.movablePieces.length).toEqual(0);

		assignPieceToSpace(players[0].pieces[1], boardSpaces[1]);

		cardResult = game.getMovablePiecesForCard(players[0], swapCard);
		expect(cardResult.movablePieces.length).toEqual(1);
	});

	it('should not allow swapping a space into goal', () => {
		assignPieceToSpace(players[0].pieces[0], players[0].goal[0]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[61]);

		const cardResult = game.getMovablePiecesForCard(players[1], swapCard);
		expect(cardResult.movablePieces.length).toEqual(0);
	});

	it('should not allow swapping a space from goal', () => {
		assignPieceToSpace(players[0].pieces[0], players[0].goal[0]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[61]);

		const cardResult = game.getMovablePiecesForCard(players[0], swapCard);
		expect(cardResult.movablePieces.length).toEqual(0);
	});

	//
	// MOVEMENT - testing spacePossibilitesForPiece and getMovablePiecesForCard
	//

	it('should allow moving a piece around the board or into its own goal', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[63]);

		const spacePossibilities = game.getSpacePossibilitesForPiece(players[0].pieces[0]);
		expect(spacePossibilities[2].length).toEqual(2);
		expect(spacePossibilities[2][0].isGoal).toBeFalse();
		expect(spacePossibilities[2][0]).toEqual(boardSpaces[1]);
		expect(spacePossibilities[2][1].isGoal).toBeTrue();

		const error = game.executePlayCard(players[0], new Card({value: 2}), players[0].pieces[0], boardSpaces[1]);

		expect(players[0].pieces[0].space).toEqual(boardSpaces[1]);
		expect(boardSpaces[1].piece).toEqual(players[0].pieces[0]);
		expect(boardSpaces[0].piece).toBeFalsy();
	});

	it('should allow a piece to loop around backward, but not into a goal', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[3]);

		const spacePossibilities = game.getSpacePossibilitesForPiece(players[0].pieces[0]);

		expect(spacePossibilities[-4]).toBeTruthy();
		expect(spacePossibilities[-4].length).toEqual(1);
		expect(spacePossibilities[-4][0]).toEqual(boardSpaces[63]);

		game.executePlayCard(players[0], new Card({value: -4}), players[0].pieces[0], boardSpaces[63]);

		expect(players[0].pieces[0].space).toEqual(boardSpaces[63]);
		expect(boardSpaces[63].piece).toEqual(players[0].pieces[0]);
		expect(boardSpaces[3].piece).toBeFalsy();
	});

	it('should not allow a piece to move into another player\'s goal', () => {
		assignPieceToSpace(players[1].pieces[0], boardSpaces[63]);

		const spacePossibilities = game.getSpacePossibilitesForPiece(players[1].pieces[0]);
		expect(spacePossibilities[2].length).toEqual(1);
		expect(spacePossibilities[2][0].isGoal).toBeFalse();
	});

	it('should not allow another player\'s piece to pass our piece on own home/start', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[61]);

		const spacePossibilities = game.getSpacePossibilitesForPiece(players[1].pieces[0]);
		expect(spacePossibilities[1]).toBeTruthy();
		expect(spacePossibilities[5]).toBeFalsy();
	});

	it('should not allow our piece to pass another of our own pieces on own home/start', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);
		assignPieceToSpace(players[0].pieces[1], boardSpaces[63]);

		const spacePossibilities = game.getSpacePossibilitesForPiece(players[0].pieces[1]);
		expect(spacePossibilities[1]).toBeFalsy();
		expect(spacePossibilities[2]).toBeFalsy();
		expect(spacePossibilities[-4]).toBeTruthy();
	});

	it('should allow a piece to land on any other piece not in a goal', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);
		assignPieceToSpace(players[0].pieces[1], boardSpaces[2]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[3]);

		expect(players[1].home.length).toEqual(3);

		const spacePossibilities = game.getSpacePossibilitesForPiece(players[0].pieces[0]);
		expect(spacePossibilities[2]).toBeTruthy();
		expect(spacePossibilities[2][0].piece).toBeTruthy();
		expect(spacePossibilities[3]).toBeTruthy();
		expect(spacePossibilities[3][0].piece).toBeTruthy();
		expect(spacePossibilities[4][0].piece).toBeFalsy();

		game.executePlayCard(players[0], new Card({ value: 3}), players[0].pieces[0], spacePossibilities[3][0]);

		expect(boardSpaces[0].piece).toBeFalsy();
		expect(boardSpaces[3].piece).toEqual(players[0].pieces[0]);
		expect(players[0].pieces[0].space).toEqual(boardSpaces[3]);
		expect(players[1].home.length).toEqual(4);
		expect(players[1].pieces[0].space).toBeFalsy();
	});

	it('should allow a piece in the goal to only move forward in the goal', () => {
		assignPieceToSpace(players[0].pieces[0], players[0].goal[1]);

		const spacePossibilities = game.getSpacePossibilitesForPiece(players[0].pieces[0]);
		expect(spacePossibilities[2].length).toEqual(1);
		expect(spacePossibilities[3]).toBeUndefined();
		expect(spacePossibilities[-4]).toBeUndefined();

		let { movablePieces } = game.getMovablePiecesForCard(players[0], new Card({ value: 2 }));

		expect(movablePieces.length).toEqual(1);
		expect(movablePieces[0].spaces.length).toEqual(1);
		expect(movablePieces[0].spaces[0]).toEqual(players[0].goal[3]);

		({ movablePieces } = game.getMovablePiecesForCard(players[0], new Card({ value: 3 })));
		expect(movablePieces.length).toEqual(0);

		game.executePlayCard(players[0], new Card({value: 2 }), players[0].pieces[0], players[0].goal[3]);

		expect(players[0].pieces[0].space).toEqual(players[0].goal[3]);
		expect(players[0].goal[3].piece).toEqual(players[0].pieces[0]);
		expect(players[0].goal[1].piece).toBeFalsy();
	});

	it('should not allow a piece in the goal to move to a space already occupied', () => {
		assignPieceToSpace(players[0].pieces[0], players[0].goal[0]);
		assignPieceToSpace(players[0].pieces[1], players[0].goal[3]);

		const spacePossibilities = game.getSpacePossibilitesForPiece(players[0].pieces[0]);
		expect(spacePossibilities[2].length).toEqual(1);
		expect(spacePossibilities[3]).toBeFalsy();
	});

	it('should not allow a piece outside the goal to move into an occupied space in the goal', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[63]);
		assignPieceToSpace(players[0].pieces[1], players[0].goal[1]);

		const spacePossibilities = game.getSpacePossibilitesForPiece(players[0].pieces[0]);

		expect(spacePossibilities[2].length).toEqual(2);
		expect(spacePossibilities[2][1].isGoal).toBeTruthy();
		expect(spacePossibilities[3].length).toEqual(1);
		expect(spacePossibilities[3][0].isGoal).toBeFalsy();
	});


	//
	// STARTING
	//

	it('should allow a piece to be started', () => {
		const { movablePieces } = game.getMovablePiecesForCard(players[0], new Card({ startable: true }));

		expect(movablePieces.length).toEqual(1);
		expect(movablePieces[0].piece).toEqual(players[0].home[0]);
		expect(movablePieces[0].spaces.length).toEqual(1);
		expect(movablePieces[0].spaces[0]).toEqual(boardSpaces[0]);

		game.executePlayCard(players[0], startCard, players[0].home[0], boardSpaces[0]);

		expect(boardSpaces[0].piece).toEqual(players[0].pieces[0]);
		expect(players[0].pieces[0].space).toEqual(boardSpaces[0]);
		expect(players[0].home.length).toEqual(3);
	});

	it('should not allow a piece to be started if home is already occupied by own piece', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);

		const { movablePieces } = game.getMovablePiecesForCard(players[0], new Card({ startable: true }));
		expect(movablePieces.length).toEqual(0);
	});

	it('should allow a piece to be started if home is occupied by an opposing piece', () => {
		assignPieceToSpace(players[1].pieces[0], boardSpaces[0]);

		expect(players[1].home.length).toEqual(3);

		const { movablePieces } = game.getMovablePiecesForCard(players[0], startCard);
		expect(movablePieces.length).toEqual(1);

		game.executePlayCard(players[0], startCard, players[0].home[0], boardSpaces[0]);

		expect(boardSpaces[0].piece).toEqual(players[0].pieces[0]);
		expect(players[1].pieces[0].space).toBeFalsy();
		expect(players[1].home.length).toEqual(4);
	});


});
