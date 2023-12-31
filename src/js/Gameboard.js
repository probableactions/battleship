import createShip from './Ship';

export default function createGameboard() {
	const gameboard = {};
	gameboard.board = [];
	gameboard.ships = [];
	gameboard.sunkShips = [];
	gameboard.missedAttacks = new Set();
	gameboard.successfulAttacks = new Set();
	gameboard.allShipsSunk = false;
	gameboard.shipTypes = [
		{ name: 'Carrier', length: 5 },
		{ name: 'Battleship', length: 4 },
		{ name: 'Cruiser', length: 3 },
		{ name: 'Submarine', length: 3 },
		{ name: 'Destroyer', length: 2 },
	];
	gameboard.placedShipTypes = new Set();

	for (let i = 0; i < 10; i += 1) {
		gameboard.board[i] = [];
		for (let j = 0; j < 10; j += 1) {
			gameboard.board[i][j] = null;
		}
	}

	gameboard.calculatePlacement = (length, originCoord, horizontal = true) => {
		const [x, y] = originCoord;
		const shipCells = [];
		if (horizontal) {
			for (let i = 0; i < length; i += 1) {
				shipCells.push([x + i, y]);
			}
		}
		if (!horizontal) {
			for (let i = 0; i < length; i += 1) {
				shipCells.push([x, i + y]);
			}
		}
		return shipCells;
	};
	const validateRange = (rangeCells) => {
		const validateXArray = rangeCells.every(
			(cell) => cell[0] >= 0 && cell[0] < 10
		);
		const validateYArray = rangeCells.every(
			(cell) => cell[1] >= 0 && cell[1] < 10
		);
		return validateXArray && validateYArray;
	};
	const validateNoCollision = (collisionCells) => {
		const checkedCells = [];
		collisionCells.forEach((cell) => {
			const [x, y] = cell;
			checkedCells.push(gameboard.board[y][x] === null);
		});
		return checkedCells.every((cell) => cell === true);
	};

	const validateShipPlacement = (shipCells) => {
		if (!validateRange(shipCells)) {
			throw new RangeError('Ship placement is out of bounds');
			return false;
		}
		if (!validateNoCollision(shipCells)) {
			throw new Error('Ship placement collides with another ship');
			return false;
		}
		return true;
	};

	gameboard.isValidPlacement = (shipCells) => {
		if (!validateRange(shipCells)) {
			return false;
		}
		if (!validateNoCollision(shipCells)) {
			return false;
		}
		return true;
	};
	gameboard.placeShip = (length, originCoord = [], horizontal = true) => {
		if (gameboard.ships.length >= 5)
			throw new Error(`A board cannot contain more than 5 ships`);
		else {
			const newPlacement = gameboard.calculatePlacement(
				length,
				originCoord,
				horizontal
			);
			if (validateShipPlacement(newPlacement)) {
				const [x, y] = originCoord;
				const ship = createShip(length);
				if (horizontal) {
					for (let i = 0; i < ship.length; i += 1) {
						gameboard.board[y][i + x] = 'X';
						ship.cells.add(String([x + i, y]));
					}
				}
				if (!horizontal) {
					for (let i = 0; i < ship.length; i += 1) {
						gameboard.board[i + y][x] = 'X';
						ship.cells.add(String([x, i + y]));
					}
				}
				gameboard.ships.push(ship);
			}
		}
	};
	gameboard.randomizeShips = () => {
		if (gameboard.ships.length >= 5) return;
		const originCoord = getRandomCoord();
		const orientation = getRandomOrientation();
		try {
			for (let i = 0; i < 5; i += 1) {
				const currentShip = gameboard.shipTypes[i];
				if (!gameboard.placedShipTypes.has(currentShip.name)) {
					gameboard.placeShip(currentShip.length, originCoord, orientation);
					gameboard.placedShipTypes.add(currentShip.name);
				}
			}
		} catch {
			while (gameboard.ships.length < 5) {
				gameboard.randomizeShips();
			}
		}
	};

	gameboard.receiveAttack = (coord = []) => {
		const [x, y] = coord;
		if (gameboard.board[y][x] === null) {
			gameboard.missedAttacks.add(String(coord));
			gameboard.board[y][x] = 'M';
		}
		if (gameboard.board[y][x] === 'X') {
			gameboard.successfulAttacks.add(String(coord));
			gameboard.board[y][x] = 'H';
			const hitShipIndex = gameboard.ships.findIndex((ship) =>
				ship.cells.has(String(coord))
			);
			const hitShip = gameboard.ships[hitShipIndex];
			hitShip.hit();
			if (hitShip.sunk === true) {
				gameboard.sunkShips.push(hitShip);
			}
			if (gameboard.sunkShips.length === 5) {
				gameboard.allShipsSunk = true;
			}
		}
	};

	return gameboard;
}
const getRandomCoord = () => {
	const possibleCoords = [];
	for (let i = 0; i < 10; i += 1) {
		for (let j = 0; j < 10; j += 1) {
			possibleCoords.push([i, j]);
		}
	}
	return possibleCoords[Math.floor(Math.random() * possibleCoords.length)];
};
const getRandomOrientation = () => {
	const number = Math.random() * 1;
	return number >= 0.5;
};
