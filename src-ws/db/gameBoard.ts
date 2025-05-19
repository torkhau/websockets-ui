type Cell = undefined | 'ship' | 'shot' | 'miss' | 'killed';

export type Coordinates = { x: number; y: number };

export interface ShipData {
  position: Coordinates;
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

interface Ship {
  positions: Coordinates[];
  hits: Set<string>;
}

interface Board {
  cells: Cell[][];
  ships: Ship[];
  rawShips?: ShipData[];
}

const LENGTH = 10;

export class GameBoard {
  private readonly board: Board = {
    cells: Array.from({ length: LENGTH }, () => Array.from({ length: LENGTH }, () => undefined)),
    ships: [],
  };

  private placeShip(initPosition: Coordinates, direction: boolean, length: number): void {
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

  public addShips(ships: ShipData[]) {
    this.board.rawShips = [...ships];
    ships.forEach(({ position, direction, length }) => this.placeShip(position, direction, length));
  }

  public getRawShips(): ShipData[] {
    return this.board.rawShips ? [...this.board.rawShips] : [];
  }

  public shoot({ x, y }: Coordinates): 'miss' | 'shot' | 'killed' {
    const cell = this.board.cells[y][x];

    if (cell === undefined) {
      this.board.cells[y][x] = 'miss';
      return 'miss';
    }

    if (cell === 'ship') {
      this.board.cells[y][x] = 'shot';

      const key = `${x},${y}`;
      const ship = this.board.ships.find((s) => s.positions.some((p) => p.x === x && p.y === y));

      if (ship) {
        ship.hits.add(key);

        if (ship.hits.size === ship.positions.length) {
          ship.positions.forEach(({ x, y }) => {
            this.board.cells[y][x] = 'killed';
          });
          return 'killed';
        }

        return 'shot';
      }
    }

    if (cell === 'shot' || cell === 'killed' || cell === 'miss') {
      return cell;
    }

    return 'miss';
  }
}
