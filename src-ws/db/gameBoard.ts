type Cell = undefined | 'ship' | 'hit' | 'miss' | 'sunk';

type Coordinates = { x: number; y: number };

interface Ship {
  positions: Coordinates[];
  hits: Set<string>;
}

interface Board {
  cells: Cell[][];
  ships: Ship[];
}

const LENGTH = 10;

export class GameBoard {
  private readonly board: Board = {
    cells: Array.from({ length: LENGTH }, () => Array.from({ length: LENGTH }, () => undefined)),
    ships: [],
  };

  public placeShip(initPosition: Coordinates, direction: boolean, length: number): void {
    const ship: Ship = {
      positions: [],
      hits: new Set(),
    };

    for (let i = 0; i < length; i += 1) {
      const x = direction ? initPosition.x : initPosition.x + i;
      const y = direction ? initPosition.y + i : initPosition.y;

      this.board.cells[y][x] = 'ship';
      ship.positions.push({ x, y });
    }

    this.board.ships.push(ship);
  }

  public shoot({ x, y }: Coordinates): 'miss' | 'hit' | 'sunk' {
    const cell = this.board.cells[y][x];

    if (cell === undefined) {
      this.board.cells[y][x] = 'miss';
      return 'miss';
    }

    if (cell === 'ship') {
      this.board.cells[y][x] = 'hit';

      const key = `${x},${y}`;
      const ship = this.board.ships.find((s) => s.positions.some((p) => p.x === x && p.y === y));

      if (ship) {
        ship.hits.add(key);

        if (ship.hits.size === ship.positions.length) {
          ship.positions.forEach(({ x, y }) => {
            this.board.cells[y][x] = 'sunk';
          });
          return 'sunk';
        }

        return 'hit';
      }
    }

    return 'miss';
  }
}
