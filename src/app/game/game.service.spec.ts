import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CardAction, CardSpecials } from './card.model';
import { GameService } from './game.service';
import { FullMove } from './interfaces';
import { Piece } from './piece.model';
import { Player } from './player.model';
import { Space } from './space.model';


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

describe('Game Service - Cards / Movement', () => {

	let game: GameService;

	let boardSpaces: Space[];
	let players: Player[];

	const Actions: Record<string, CardAction> = {
		swap: {
			special: CardSpecials.SWAP
		},
		startable: {
			startable: true
		},
		burningSeven: {
			value: 7,
			special: CardSpecials.BURNING
		}
	};


	/*const swapCard = new Card({
		symbol: 'S',
		special: CardSpecials.SWAP
	});

	const startCard = new Card({
		startable: true
	});

	const burningSeven = new Card({
		special: CardSpecials.BURNING,
		value: 7
	});*/

	const assignPieceToSpace = (piece: Piece, space: Space) => {
		game.performMove({
			piece,
			endSpace: space,
			startSpace: piece.space ? piece.space : null
		});
	};

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
	// Utility Testing
	//

	it ('should start and move a piece', () => {
		game.performMove({
			piece: players[0].pieces[0],
			endSpace: boardSpaces[0]
		});

		expect(players[0].home.length).toEqual(3);
		expect(boardSpaces[0].piece).toEqual(players[0].pieces[0]);
		expect(players[0].pieces[0].space).toEqual(boardSpaces[0]);

		game.performMove({
			piece: players[0].pieces[0],
			startSpace: boardSpaces[0],
			endSpace: boardSpaces[5]
		});

		expect(players[0].home.length).toEqual(3);
		expect(boardSpaces[0].piece).toBeFalsy();
		expect(boardSpaces[5].piece).toEqual(players[0].pieces[0]);
		expect(players[0].pieces[0].space).toEqual(boardSpaces[5]);
	});

	it ('should have a local alias for easily assigning pieces in these tests', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);

		expect(players[0].home.length).toEqual(3);
		expect(boardSpaces[0].piece).toEqual(players[0].pieces[0]);
		expect(players[0].pieces[0].space).toEqual(boardSpaces[0]);
	});

	it ('should be able to undo a move', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[5]);

		const move: FullMove = {
			piece: players[0].pieces[0],
			startSpace: boardSpaces[5],
			endSpace: boardSpaces[10]
		};

		game.performMove(move);

		expect(boardSpaces[5].piece).toBeFalsy();
		expect(boardSpaces[10].piece).toEqual(players[0].pieces[0]);
		expect(players[0].pieces[0].space).toEqual(boardSpaces[10]);

		game.undoMove(move);

		expect(boardSpaces[5].piece).toEqual(players[0].pieces[0]);
		expect(boardSpaces[10].piece).toBeFalsy();
		expect(players[0].pieces[0].space).toEqual(boardSpaces[5]);
	});

	it ('should be able to undo a swap', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[5]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[10]);

		expect(boardSpaces[5].piece).toEqual(players[0].pieces[0]);
		expect(boardSpaces[10].piece).toEqual(players[1].pieces[0]);

		const swapMoves = game.createFullMoves(players[0], Actions.swap, {
			piece: players[0].pieces[0],
			space: boardSpaces[10]
		});

		swapMoves.fullMoves.forEach(move => game.performMove(move));

		expect(boardSpaces[5].piece).toEqual(players[1].pieces[0]);
		expect(boardSpaces[10].piece).toEqual(players[0].pieces[0]);

		swapMoves.fullMoves.forEach(move => game.undoMove(move));

		expect(boardSpaces[5].piece).toEqual(players[0].pieces[0]);
		expect(boardSpaces[10].piece).toEqual(players[1].pieces[0]);


	});

	//
	// SWAPPING - testing getMovablePiecesForCard
	//

	it('should allow swapping pieces', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[10]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[20]);

		const { movablePieces } = game.getMovablePiecesForAction(players[0], Actions.swap);

		expect(movablePieces.length).toEqual(1);
		expect(movablePieces[0].spaces.length).toEqual(1);
		expect(movablePieces[0].spaces[0]).toEqual(boardSpaces[20]);
	});

	it ('should not allow swapping own pieces', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[10]);
		assignPieceToSpace(players[0].pieces[1], boardSpaces[20]);

		const { movablePieces } = game.getMovablePiecesForAction(players[0], Actions.swap);

		expect(movablePieces.length).toEqual(0);
	});

	it('should not allow swapping a piece to the home space', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[61]);

		let cardResult = game.getMovablePiecesForAction(players[1], Actions.swap);
		expect(cardResult.movablePieces.length).toEqual(0);

		assignPieceToSpace(players[0].pieces[1], boardSpaces[1]);

		cardResult = game.getMovablePiecesForAction(players[1], Actions.swap);
		expect(cardResult.movablePieces.length).toEqual(1);
	});

	it('should not allow swapping our piece to any space', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[61]);

		let cardResult = game.getMovablePiecesForAction(players[0], Actions.swap);
		expect(cardResult.movablePieces.length).toEqual(0);

		assignPieceToSpace(players[0].pieces[1], boardSpaces[1]);

		cardResult = game.getMovablePiecesForAction(players[0], Actions.swap);
		expect(cardResult.movablePieces.length).toEqual(1);
	});

	it('should not allow swapping a space into goal', () => {
		assignPieceToSpace(players[0].pieces[0], players[0].goal[0]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[61]);

		const cardResult = game.getMovablePiecesForAction(players[1], Actions.swap);
		expect(cardResult.movablePieces.length).toEqual(0);
	});

	it('should not allow swapping a space from goal', () => {
		assignPieceToSpace(players[0].pieces[0], players[0].goal[0]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[61]);

		const cardResult = game.getMovablePiecesForAction(players[0], Actions.swap);
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

		const error = game.executeAction(players[0], { value: 2 }, [{
			piece: players[0].pieces[0],
			space: boardSpaces[1]
		}]);

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

		game.executeAction(players[0], {value: -4}, [{
			piece: players[0].pieces[0],
			space: boardSpaces[63]
		}]);

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

		game.executeAction(players[0], { value: 3}, [{
			piece: players[0].pieces[0],
			space: spacePossibilities[3][0]
		}]);

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

		let { movablePieces } = game.getMovablePiecesForAction(players[0], { value: 2 });

		expect(movablePieces.length).toEqual(1);
		expect(movablePieces[0].spaces.length).toEqual(1);
		expect(movablePieces[0].spaces[0]).toEqual(players[0].goal[3]);

		({ movablePieces } = game.getMovablePiecesForAction(players[0], { value: 3 }));
		expect(movablePieces.length).toEqual(0);

		game.executeAction(players[0], { value: 2 }, [{
			piece: players[0].pieces[0],
			space: players[0].goal[3]
		}]);

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

	it('should not allow a piece in the goal to move past another piece in the goal', () => {
		assignPieceToSpace(players[0].pieces[0], players[0].goal[0]);
		assignPieceToSpace(players[0].pieces[1], players[0].goal[1]);

		const spacePossibilities = game.getSpacePossibilitesForPiece(players[0].pieces[0]);

		expect(Object.values(spacePossibilities).length).toEqual(0);
	});

	it('should not allow a piece outside the goal to move into an occupied space in the goal, or past a piece into the goal', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[63]);
		assignPieceToSpace(players[0].pieces[1], players[0].goal[1]);

		const spacePossibilities = game.getSpacePossibilitesForPiece(players[0].pieces[0]);

		expect(spacePossibilities[2].length).toEqual(2);
		expect(spacePossibilities[2][1].isGoal).toBeTruthy();
		expect(spacePossibilities[3].length).toEqual(1);
		expect(spacePossibilities[3][0].isGoal).toBeFalsy();
		expect(spacePossibilities[4].length).toEqual(1);
		expect(spacePossibilities[4][0].isGoal).toBeFalsy();
	});

	//
	// BURNING SEVEN
	//

	it('should allow one piece to be moved full distance', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[15]);
		assignPieceToSpace(players[0].pieces[1], boardSpaces[17]);

		assignPieceToSpace(players[1].pieces[0], boardSpaces[16]);

		const { movablePieces } = game.getMovablePiecesForAction(players[0], Actions.burningSeven);

		expect(movablePieces.length).toEqual(1);
		expect(movablePieces[0].piece).toEqual(players[0].pieces[1]);

		game.executeAction(players[0], Actions.burningSeven, [{
			piece: players[0].pieces[1],
			space: boardSpaces[24]
		}]);

		expect(boardSpaces[24].piece).toEqual(players[0].pieces[1]);
	});

	it('should allow the same piece to be moved twice', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);

		game.executeAction(players[0], Actions.burningSeven, [
			{
				piece: players[0].pieces[0],
				space: boardSpaces[5],
			},
			{
				piece: players[0].pieces[0],
				space: boardSpaces[7]
			}
		]);

		expect(boardSpaces[0].piece).toBeFalsy();
		expect(boardSpaces[5].piece).toBeFalsy();
		expect(boardSpaces[7].piece).toBeTruthy();
	});

	it('should send burnt pieces back to their home', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);
		assignPieceToSpace(players[0].pieces[1], boardSpaces[1]);
		assignPieceToSpace(players[0].pieces[2], boardSpaces[2]);
		assignPieceToSpace(players[0].pieces[3], boardSpaces[3]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[4]);
		assignPieceToSpace(players[1].pieces[1], boardSpaces[5]);
		assignPieceToSpace(players[1].pieces[2], boardSpaces[6]);
		assignPieceToSpace(players[1].pieces[3], boardSpaces[7]);

		expect(players[0].home.length).toEqual(0);
		expect(players[0].home.length).toEqual(0);

		game.executeAction(players[0], Actions.burningSeven, [{
			piece: players[0].pieces[0],
			space: boardSpaces[7]
		}]);

		expect(players[0].home.length).toEqual(3);
		expect(players[1].home.length).toEqual(4);
		expect(boardSpaces[2].piece).toBeFalsy();
		expect(boardSpaces[5].piece).toBeFalsy();
		expect(boardSpaces[7].piece).toEqual(players[0].pieces[0]);
	});

	it ('should burn while looping around the board', () => {
		assignPieceToSpace(players[1].pieces[0], boardSpaces[62]);
		assignPieceToSpace(players[0].pieces[0], boardSpaces[2]);

		game.executeAction(players[1], Actions.burningSeven, [{
			piece: players[1].pieces[0],
			space: boardSpaces[5]
		}]);

		expect(players[0].home.length).toEqual(4);
		expect(players[0].pieces[0].space).toBeFalsy();
		expect(boardSpaces[2].piece).toBeFalsy();
		expect(boardSpaces[5].piece).toEqual(players[1].pieces[0]);
	});

	it('should allow two pieces to be moved', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);
		assignPieceToSpace(players[0].pieces[1], boardSpaces[8]);

		const { movablePieces } = game.getMovablePiecesForAction(players[0], Actions.burningSeven);

		expect(movablePieces.length).toEqual(2);

		game.executeAction(players[0], Actions.burningSeven, [
			{
				piece: players[0].pieces[0],
				space: boardSpaces[3]
			},
			{
				piece: players[0].pieces[1],
				space: boardSpaces[12]
			}
		]);

		expect(boardSpaces[3].piece).toEqual(players[0].pieces[0]);
		expect(boardSpaces[12].piece).toEqual(players[0].pieces[1]);
	});

	it('should allow movement when multiple pieces would be blocked individually', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[10]);
		assignPieceToSpace(players[0].pieces[1], boardSpaces[29]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[16]);
		assignPieceToSpace(players[2].pieces[0], boardSpaces[32]);

		const { movablePieces } = game.getMovablePiecesForAction(players[0], Actions.burningSeven);

		expect(movablePieces.length).toEqual(2);
		expect(movablePieces[0].spaces.length).toEqual(1);
		expect(movablePieces[1].spaces.length).toEqual(1);

		game.createFullMoves(players[0], Actions.burningSeven, {
			piece: players[0].pieces[0],
			space: boardSpaces[15]
		}).fullMoves.forEach(move => game.performMove(move));

		const { movablePieces: partTwo } = game.getMovablePiecesForAction(players[0], Actions.burningSeven, 2);

		expect(partTwo.length).toEqual(1);
		expect(partTwo[0].spaces.length).toEqual(2);
		expect(partTwo[0].spaces[0]).toEqual(boardSpaces[30]);
		expect(partTwo[0].spaces[1]).toEqual(boardSpaces[31]);
	});

	it('should require all spaces to be used', () => {
		assignPieceToSpace(players[1].pieces[0], boardSpaces[16]);
		assignPieceToSpace(players[0].pieces[0], boardSpaces[15]);
		assignPieceToSpace(players[0].pieces[1], boardSpaces[14]);

		const { movablePieces } = game.getMovablePiecesForAction(players[0], Actions.burningSeven);

		expect(movablePieces.length).toEqual(0);
	});

	it('it should enforce the order that pieces must move', () => {
		//    space no       0123456
		// For example, say: 1--2--X
		// Piece 2 needs to move before piece 1 can move
		assignPieceToSpace(players[0].pieces[0], boardSpaces[10]);
		assignPieceToSpace(players[0].pieces[1], boardSpaces[13]);
		assignPieceToSpace(players[1].pieces[0], boardSpaces[16]);

		const { movablePieces } = game.getMovablePiecesForAction(players[0], Actions.burningSeven);

		expect(movablePieces.length).toEqual(1);
		expect(movablePieces[0].piece).toEqual(players[0].pieces[1]);

	});


	//
	// STARTING
	//

	it('should allow a piece to be started', () => {
		const { movablePieces } = game.getMovablePiecesForAction(players[0], Actions.startable);

		expect(movablePieces.length).toEqual(1);
		expect(movablePieces[0].piece).toEqual(players[0].home[0]);
		expect(movablePieces[0].spaces.length).toEqual(1);
		expect(movablePieces[0].spaces[0]).toEqual(boardSpaces[0]);

		game.executeAction(players[0], Actions.startable, [{
			piece: players[0].home[0],
			space: boardSpaces[0]
		}]);

		expect(boardSpaces[0].piece).toEqual(players[0].pieces[0]);
		expect(players[0].pieces[0].space).toEqual(boardSpaces[0]);
		expect(players[0].home.length).toEqual(3);
	});

	it('should not allow a piece to be started if home is already occupied by own piece', () => {
		assignPieceToSpace(players[0].pieces[0], boardSpaces[0]);

		const { movablePieces } = game.getMovablePiecesForAction(players[0], Actions.startable);
		expect(movablePieces.length).toEqual(0);
	});

	it('should allow a piece to be started if home is occupied by an opposing piece', () => {
		assignPieceToSpace(players[1].pieces[0], boardSpaces[0]);

		expect(players[1].home.length).toEqual(3);

		const { movablePieces } = game.getMovablePiecesForAction(players[0], Actions.startable);
		expect(movablePieces.length).toEqual(1);

		game.executeAction(players[0], Actions.startable, [{
			piece: players[0].home[0],
			space: boardSpaces[0]
		}]);

		expect(boardSpaces[0].piece).toEqual(players[0].pieces[0]);
		expect(players[1].pieces[0].space).toBeFalsy();
		expect(players[1].home.length).toEqual(4);
	});

	//
	// Util
	//

	it('should properly calculate distance between spaces', () => {
		expect(game.getDistanceBetweenSpaces(boardSpaces[0], boardSpaces[5])).toEqual(5);
		expect(game.getDistanceBetweenSpaces(boardSpaces[63], boardSpaces[1])).toEqual(2);
		expect(game.getDistanceBetweenSpaces(boardSpaces[15], players[1].goal[1])).toEqual(3);
		expect(game.getDistanceBetweenSpaces(boardSpaces[63], players[0].goal[2])).toEqual(4);
		expect(game.getDistanceBetweenSpaces(players[0].goal[0], players[0].goal[1])).toEqual(1);
	});


});
